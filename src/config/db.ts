import { Sequelize } from 'sequelize-typescript';
import dotenv from 'dotenv';
import { config } from './environment';
import Payments from '../models/Payment.model';

dotenv.config();

const sequelize = new Sequelize(config.databaseUrl, {
  models: [Payments],
  logging: false,
});

export default sequelize;