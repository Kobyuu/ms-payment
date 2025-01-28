// filepath: microservicios/ms-payment/src/config/dbConfig.ts
import { Sequelize } from 'sequelize';
import { config } from './config';

const sequelize = new Sequelize(config.databaseUrl, {
  dialect: 'postgres',
  logging: false,
});

export default sequelize;