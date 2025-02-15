import { Sequelize } from 'sequelize-typescript';
import dotenv from 'dotenv';
import colors from 'colors';
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from './constants';
import { CONFIG } from './constants';
import { DatabaseService } from '../types/types';

dotenv.config();

console.log('DATABASE_URL:', process.env.DATABASE_URL);

if (!process.env.DATABASE_URL) {
    throw new Error(ERROR_MESSAGES.GENERAL.DB_URL_NOT_DEFINED);
}

// Crear una instancia de Sequelize con la URL de la base de datos
const sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    models: [__dirname + '/../models/**/*.ts'],
    logging: false,
  pool: {
    max: CONFIG.DATABASE_POOL_MAX_CONNECTIONS,
    min: CONFIG.DATABASE_POOL_MIN_CONNECTIONS,
    idle: CONFIG.DATABASE_POOL_IDLE_TIME,
    acquire: CONFIG.DATABASE_POOL_ACQUIRE_TIMEOUT
  }
});

// Hook para intentar reconectar automáticamente si la conexión se pierde
sequelize.addHook('afterDisconnect', async () => {
console.log('Conexión a la base de datos perdida. Intentando reconectar...');
try {
  await sequelize.authenticate();
  console.log('Reconectado a la base de datos con éxito.');
} catch (err) {
  console.error('Error al intentar reconectar:', err);
}
});

export async function connectDb(): Promise<void> {
    try {
        await sequelize.authenticate();
        await sequelize.sync(); // Sincroniza el esquema
        console.log(colors.bgGreen.white(SUCCESS_MESSAGES.GENERAL.DB_CONNECTION_SUCCESS));
    } catch (error) {
        console.error(colors.bgRed.white(ERROR_MESSAGES.GENERAL.DB_CONNECTION_ERROR), error);
        throw error; // Lanza el error para que el servidor lo gestione
    }
}

class SequelizeDatabaseService implements DatabaseService {
  async transaction(): Promise<any> {
    return sequelize.transaction();
  }
}

export const dbService = new SequelizeDatabaseService();
export default sequelize;
