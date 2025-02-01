import { Sequelize } from 'sequelize-typescript';
import dotenv from 'dotenv';
import { config } from './environment';

dotenv.config();

const sequelize = new Sequelize(config.databaseUrl, {
  models: [__dirname + '/../models/**/*.ts'],
  logging: false,
});

export default sequelize;