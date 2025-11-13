const { Mutex } = require('async-mutex');
const config = require('./dbconfig');
const { Sequelize, DataTypes } = require('sequelize');
const { initAuthCreds, proto } = require('baileys');

const RETRY_CONFIG = {
    maxRetries: 5,
    retryDelay: 50,
    backoffMultiplier: 1.5
};

const dbLocks = new Map();

const getDbLock = (key) => {
    let mutex = dbLocks.get(key);
    if (!mutex) {
        mutex = new Mutex();
        dbLocks.set(key, mutex);
    }
    return mutex;
};

const AuthStateDB = config.DATABASE.define("AuthState", {
    key: {
        type: DataTypes.STRING,
        primaryKey: true,
        allowNull: false,
        validate: {
            notEmpty: true,
            len: [1, 500]
        }
    },
    value: {
        type: DataTypes.TEXT('long'),
        allowNull: true,
    },
}, {
    indexes: [
        {
            fields: ['key'],
            unique: true
        }
    ],
    timestamps: true,
});

const BufferJSON = {
    replacer: (key, value) => {
        if (value instanceof Buffer) {
            return {
                type: 'Buffer',
                data: value.toString('base64')
            };
        }
        if (value?.type === 'Buffer' && Array.isArray(value?.data)) {
            return {
                type: 'Buffer',
                data: Buffer.from(value.data).toString('base64')
            };
        }
        if (value instanceof Uint8Array) {
            return {
                type: 'Buffer',
                data: Buffer.from(value).toString('base64')
            };
        }
        return value;
    },

    reviver: (key, value) => {
        if (value?.type === 'Buffer' && typeof value?.data === 'string') {
            try {
                return Buffer.from(value.data, 'base64');
            } catch (error) {
                console.error(`Failed to parse Buffer for key ${key}:`, error);
                return value;
            }
        }
        return value;
    }
};

const retryOperation = async (operation, context = '') => {
    let lastError;

    for (let attempt = 0; attempt < RETRY_CONFIG.maxRetries; attempt++) {
        try {
            return await operation();
        } catch (error) {
            lastError = error;
            if (error.name === 'SequelizeValidationError' ||
                error.name === 'SequelizeUniqueConstraintError') {
                throw error;
            }
            if (attempt < RETRY_CONFIG.maxRetries - 1) {
                const delay = RETRY_CONFIG.retryDelay * Math.pow(RETRY_CONFIG.backoffMultiplier, attempt);
                console.warn(`${context} failed (attempt ${attempt + 1}/${RETRY_CONFIG.maxRetries}), retrying in ${delay}ms...`);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    }
    console.error(`${context} failed after ${RETRY_CONFIG.maxRetries} attempts:`, lastError);
    throw lastError;
};

const sanitizeKey = (key) => {
    if (!key) return key;
    return key.replace(/[<>:"|?*]/g, '_').replace(/\//g, '__').replace(/:/g, '-');
};

const useMultiDbAuthState = async () => {
    await AuthStateDB.sync({ alter: true });
    const writeData = async (data, key) => {
        const sanitizedKey = sanitizeKey(key);
        const mutex = getDbLock(sanitizedKey);
        return mutex.acquire().then(async (release) => {
            try {
                return await retryOperation(async () => {
                    const jsonData = JSON.stringify(data, BufferJSON.replacer);
                    await AuthStateDB.upsert({
                        key: sanitizedKey,
                        value: jsonData
                    }, {
                        transaction: null,
                        logging: false
                    });
                }, `writeData(${key})`);
            } catch (error) {
                console.error(`Failed to write data for key ${key}:`, error.message);
                throw error;
            } finally {
                release();
            }
        });
    };

    const readData = async (key) => {
        const sanitizedKey = sanitizeKey(key);
        const mutex = getDbLock(sanitizedKey);
        return await mutex.acquire().then(async (release) => {
            try {
                return await retryOperation(async () => {
                    const record = await AuthStateDB.findOne({
                        where: { key: sanitizedKey },
                        attributes: ['value'],
                        raw: true
                    });

                    if (!record || !record.value) {
                        return null;
                    }
                    try {
                        return JSON.parse(record.value, BufferJSON.reviver);
                    } catch (parseError) {
                        console.error(`Failed to parse JSON for key ${key}:`, parseError);
                        return null;
                    }
                }, `readData(${key})`);
            } catch (error) {
                console.error(`Failed to read data for key ${key}:`, error.message);
                return null;
            } finally {
                release();
            }
        });
    };

    const removeData = async (key) => {
        const sanitizedKey = sanitizeKey(key);
        const mutex = getDbLock(sanitizedKey);
        return mutex.acquire().then(async (release) => {
            try {
                return await retryOperation(async () => {
                    await AuthStateDB.destroy({
                        where: { key: sanitizedKey }
                    });
                }, `removeData(${key})`);
            } catch (error) {
                console.error(`Failed to remove data for key ${key}:`, error.message);
            } finally {
                release();
            }
        });
    };

    let creds = await readData('creds.json');
    if (!creds) {
        console.log('No existing credentials found, initializing new auth state...');
        creds = initAuthCreds();
        await writeData(creds, 'creds.json');
    }

    return {
        state: {
            creds,
            keys: {
                get: async (type, ids) => {
                    const data = {};
                    await Promise.all(
                        ids.map(async (id) => {
                            try {
                                let value = await readData(`${type}-${id}.json`);
                                if (type === 'app-state-sync-key' && value) {
                                    try {
                                        value = proto.Message.AppStateSyncKeyData.create(value);
                                    } catch (protoError) {
                                        console.error(`Failed to convert app-state-sync-key for id ${id}:`, protoError);
                                        value = null;
                                    }
                                }

                                data[id] = value;
                            } catch (error) {
                                console.error(`Failed to get key ${type}-${id}:`, error);
                                data[id] = null;
                            }
                        })
                    );

                    return data;
                },

                set: async (data) => {
                    const tasks = [];
                    let sessionCount = 0;
                    let errorCount = 0;
                    for (const category in data) {
                        for (const id in data[category]) {
                            const value = data[category][id];
                            const key = `${category}-${id}.json`;
                            if (category === 'session') {
                                sessionCount++;
                            }
                            const task = (async () => {
                                try {
                                    if (value) {
                                        await writeData(value, key);
                                    } else {
                                        await removeData(key);
                                    }
                                } catch (error) {
                                    errorCount++;
                                    if (category === 'session') {
                                        console.error(`Failed to save session key ${id}:`, error.message);
                                    }
                                }
                            })();
                            tasks.push(task);
                        }
                    }
                    await Promise.all(tasks);
                    if (sessionCount > 0) {
                        const successCount = sessionCount - errorCount;
                        console.log(`Saved ${successCount}/${sessionCount} session keys`);
                        if (errorCount > 0) {
                            console.warn(`${errorCount} session keys failed to save - may cause decryption errors`);
                        }
                    }
                }
            }
        },

        saveCreds: async () => {
            try {
                return await writeData(creds, 'creds.json');
            } catch (error) {
                console.error('Failed to save credentials:', error);
                throw error;
            }
        }
    };
};

const clearAuthState = async () => {
    try {
        const count = await AuthStateDB.destroy({
            where: {},
            truncate: true
        });
        console.log(`Cleared ${count} auth state records`);
        return count;
    } catch (error) {
        console.error('Failed to clear auth state:', error);
        throw error;
    }
};

const getAuthStateStats = async () => {
    try {
        const allKeys = await AuthStateDB.findAll({
            attributes: ['key'],
            raw: true
        });

        const stats = {
            total: allKeys.length,
            creds: 0,
            sessions: 0,
            preKeys: 0,
            senderKeys: 0,
            appStateSyncKeys: 0,
            lidMappings: 0,
            deviceIndex: 0,
            other: 0
        };

        allKeys.forEach(record => {
            const key = record.key;
            if (key === 'creds.json') stats.creds++;
            else if (key.startsWith('session-')) stats.sessions++;
            else if (key.startsWith('pre-key-')) stats.preKeys++;
            else if (key.startsWith('sender-key-')) stats.senderKeys++;
            else if (key.startsWith('app-state-sync-key-')) stats.appStateSyncKeys++;
            else if (key.startsWith('lid-mapping-')) stats.lidMappings++;
            else if (key.startsWith('device-index-')) stats.deviceIndex++;
            else stats.other++;
        });

        return stats;
    } catch (error) {
        console.error('Failed to get auth state stats:', error);
        return null;
    }
};

const validateAuthState = async () => {
    try {
        const stats = await getAuthStateStats();

        if (!stats) {
            return { valid: false, error: 'Failed to get stats' };
        }

        const issues = [];

        if (stats.creds === 0) {
            issues.push('No credentials found');
        }

        if (stats.sessions === 0) {
            issues.push('No sessions found - may have decryption issues');
        }

        if (stats.preKeys === 0) {
            issues.push('No pre-keys found - cannot establish new sessions');
        }

        return {
            valid: issues.length === 0,
            issues,
            stats
        };
    } catch (error) {
        return { valid: false, error: error.message };
    }
};

module.exports = {
    useMultiDbAuthState,
    clearAuthState,
    getAuthStateStats,
    validateAuthState,
    AuthStateDB
};