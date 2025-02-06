import { Sequelize } from 'sequelize-typescript';
import dotenv from 'dotenv';
import { CONFIG } from './constants/environment';
import Payments from '../models/Payment.model';
import colors from 'colors';
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from './constants';

dotenv.config();

const sequelize = new Sequelize(CONFIG.DATABASE_URL, {
  models: [Payments],
  logging: false,
});

export async function connectDb(): Promise<void> {
  try {
    await sequelize.authenticate();
    await sequelize.sync(); // Sincroniza el esquema
    console.log(colors.bgGreen.white(SUCCESS_MESSAGES.GENERAL.DB_CONNECTION_SUCCESS));
  } catch (error) {
    console.error(colors.bgRed.white(`${ERROR_MESSAGES.GENERAL.DB_CONNECTION_ERROR} ${error}`));
    throw error; // Lanza el error para que el servidor lo gestione
  }
}

export default sequelize;