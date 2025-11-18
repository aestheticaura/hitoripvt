require('./settings');
const pino = require('pino');
const chalk = require('chalk');
const readline = require('readline');
const NodeCache = require('node-cache');
const { exec } = require('child_process');
const { Boom } = require('@hapi/boom');
const { parsePhoneNumber } = require('awesome-phonenumber');
const { validateAuthState, useMultiDbAuthState } = require("./database/auth");
const { dataBase } = require('./src/database');
const { server, PORT } = require('./src/server');
const { GroupParticipantsUpdate, MessagesUpsert, Solving } = require('./src/message');
const { default: makeWASocket, useMultiFileAuthState, Browsers, DisconnectReason, makeCacheableSignalKeyStore, fetchLatestBaileysVersion, jidNormalizedUser } = require('baileys');

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const question = (text) => new Promise((resolve) => rl.question(text, resolve));

let pairingStarted = false;
let phoneNumber;

const storeDB = dataBase(global.tempatStore);
const database = dataBase(global.tempatDB);
const msgRetryCounterCache = new NodeCache();

server.listen(PORT, () => console.log('App listened on port', PORT));

async function startNazeBot() {
	const { state, saveCreds } = await useMultiFileAuthState('session');
	const { version } = await fetchLatestBaileysVersion();
	const logger = pino({ level: 'silent' });

	try {
		const loadData = await database.read();
		const storeLoadData = await storeDB.read();
		global.db = loadData && Object.keys(loadData).length ? loadData : { set: {}, cmd: {}, users: {}, groups: {}, database: {} };
		await database.write(global.db);
		global.store = storeLoadData && Object.keys(storeLoadData).length ? storeLoadData : { contacts: {}, presences: {}, messages: {}, groupMetadata: {} };
		await storeDB.write(global.store);
		setInterval(async () => {
			if (global.db) await database.write(global.db);
			if (global.store) await storeDB.write(global.store);
		}, 30_000);
	} catch (e) {
		console.error(e);
		process.exit(1);
	}

	store.loadMessage = function (remoteJid, id) {
		const messages = store.messages?.[remoteJid]?.array;
		if (!messages) return null;
		return messages.find(msg => msg?.key?.id === id) || null;
	}

	const getMessage = async (key) => {
		if (store) {
			const msg = await store.loadMessage(key.remoteJid, key.id);
			return msg?.message || ''
		}
		return {
			conversation: 'Halo Saya Naze Bot'
		}
	}
	const conn = makeWASocket({
		auth: { creds: state.creds, keys: makeCacheableSignalKeyStore(state.keys, logger) },
		logger,
		browser: Browsers.ubuntu('Chrome'),
		printQRInTerminal: true,
		downloadHistory: false,
		syncFullHistory: false,
		markOnlineOnConnect: false,
		emitOwnEvents: true,
		msgRetryCounterCache,
		version,
		generateHighQualityLinkPreview: true,
		getMessage,
	});

	const pairingCode = process.argv.includes('--pairing-code') || global.pairing_code;
	if (pairingCode && !phoneNumber && !conn.authState.creds.registered) {
		async function getPhoneNumber() {
			phoneNumber = global.number_bot ? global.number_bot : process.env.BOT_NUMBER || await question('Please type your WhatsApp number : ');
			phoneNumber = phoneNumber.replace(/[^0-9]/g, '')
			if (!parsePhoneNumber('+' + phoneNumber).valid && phoneNumber.length < 6) {
				console.log(chalk.bgBlack(chalk.redBright('Start with your Country WhatsApp code') + chalk.whiteBright(',') + chalk.greenBright(' Example : 62xxx')));
				await getPhoneNumber()
			}
		}
		(async () => {
			await getPhoneNumber();
			await exec('rm -rf ./session/*');
			console.log('Phone number captured. Waiting for Connection...\n' + chalk.blueBright('Estimated time: around 2 ~ 5 minutes'))
		})()
	}

	await Solving(conn, store);

	conn.ev.on('connection.update', async (s) => {
		const { connection, lastDisconnect, qr } = s;
		if (!conn.authState.creds.registered) console.log('Connection: ', connection || false);
		if (qr) {
			const qrcode = require('qrcode-terminal');
			qrcode.generate(qr, { small: true });
		}
		if ((connection === 'connecting' || !!qr) && pairingCode && phoneNumber && !conn.authState.creds.registered && !pairingStarted) {
			setTimeout(async () => {
				pairingStarted = true;
				console.log('Requesting Pairing Code...')
				let code = await conn.requestPairingCode(phoneNumber);
				console.log(chalk.blue('Your Pairing Code :'), chalk.green(code), '\n', chalk.yellow('Expires in 15 second'));
			}, 3000)
		}
		if (connection == 'open') {
			console.log('Login Successful!');
			await conn.sendMessage('919778383987-1633449038@g.us', { text: 'Connected!' });
		}
		if (connection === 'close') {
			const reason = new Boom(lastDisconnect?.error)?.output.statusCode
			if (reason === DisconnectReason.connectionLost) {
				console.log('Connection to Server Lost, Attempting to Reconnect...');
				startNazeBot()
			} else if (reason === DisconnectReason.connectionClosed) {
				console.log('Connection closed, Attempting to Reconnect...');
				startNazeBot()
			} else if (reason === DisconnectReason.restartRequired) {
				console.log('Restart Required...');
				startNazeBot()
			} else if (reason === DisconnectReason.timedOut) {
				console.log('Connection Timed Out, Attempting to Reconnect...');
				startNazeBot()
			} else if (reason === DisconnectReason.badSession) {
				console.log('Delete Session and Scan again...');
				startNazeBot()
			} else if (reason === DisconnectReason.connectionReplaced) {
				console.log('Close current Session first...');
			} else if (reason === DisconnectReason.loggedOut) {
				console.log('Scan again and Run...');
				exec('rm -rf ./session/*')
				process.exit(1)
			} else if (reason === DisconnectReason.forbidden) {
				console.log('Connection Failure, Scan again and Run...');
				exec('rm -rf ./session/*')
				process.exit(1)
			} else if (reason === DisconnectReason.multideviceMismatch) {
				console.log('Scan again...');
				exec('rm -rf ./session/*')
				process.exit(0)
			} else {
				conn.end(`Unknown DisconnectReason : ${reason}|${connection}`)
			}
		}

	});
	conn.ev.on('creds.update', saveCreds);
	conn.ev.on('messages.upsert', (msg) => MessagesUpsert(conn, msg, store));
	conn.ev.on('group-participants.update', (update) => GroupParticipantsUpdate(conn, update, store));
	conn.ev.on('contacts.update', (update) => {
		for (let contact of update) {
			let trueJid;
			if (!trueJid) continue;
			if (contact.id.endsWith('@lid')) {
				trueJid = conn.findJidByLid(contact.id, store);
			} else {
				trueJid = jidNormalizedUser(contact.id);
			}
			store.contacts[trueJid] = {
				...store.contacts[trueJid],
				id: trueJid,
				name: contact.notify,
			};
			if (contact.id.endsWith('@lid')) {
				store.contacts[trueJid].lid = jidNormalizedUser(contact.id);
			}
		}
	});

	// const validation = await validateAuthState();
	// if (validation.stats) console.log(`📊 Auth State: ${validation.stats.sessions} sessions, ${validation.stats.preKeys} pre-keys, ${validation.stats.lidMappings} LID mappings`);
	// if (!validation.valid && validation.issues) {
	// 	console.warn("⚠️  Auth state issues detected:");
	// 	validation.issues.forEach(issue => console.warn(`   - ${issue}`));
	// 	if (validation.issues.includes('No credentials found')) {
	// 		console.log("ℹ️  First time setup - will create new credentials");
	// 	}
	// } else if (validation.valid) {
	// 	console.log("✅ Auth state validated successfully");
	// }

	return conn;
}

startNazeBot();

async function cleanup(signal) {
	console.log(`Received ${signal}. Saving database...`);
	if (global.db) await database.write(global.db);
	if (global.store) await storeDB.write(global.store);
	server.close(() => {
		console.log('Server closed. Exiting...');
		process.exit(0);
	});
}

process.on('SIGINT', () => cleanup('SIGINT'));
process.on('SIGTERM', () => cleanup('SIGTERM'));
process.on('exit', () => cleanup('exit'));

server.on('error', (error) => {
	if (error.code === 'EADDRINUSE') {
		console.log(`Port ${PORT} in use. Retry later.`);
		server.close();
	} else {
		console.error('Server error:', error);
	}
});