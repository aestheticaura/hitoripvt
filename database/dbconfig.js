const { Sequelize } = require('sequelize');

const DATABASE_URL = process.env.DATABASE_URL || './database/session.db';

const DATABASE =
  DATABASE_URL === './database/session.db'
    ? new Sequelize({
        dialect: 'sqlite',
        storage: DATABASE_URL,
        logging: false,
      })
    : new Sequelize(DATABASE_URL, {
        dialect: 'postgres',
        ssl: true,
        protocol: 'postgres',
        dialectOptions: {
          native: true,
          ssl: { require: true, rejectUnauthorized: false },
        },
        logging: false,
      });

const config = {
  DATABASE_URL,
  DATABASE,
};

module.exports = config;