import { Sequelize } from 'sequelize-typescript';
import dotenv from 'dotenv';
import colors from 'colors';
import { ERROR_MESSAGES, SUCCESS_MESSAGES, CONFIG ,} from './constants';
import { DatabaseService } from '../types/types';
import DEFAULTS

// Carga variables de entorno
dotenv.config();

// Verifica URL de base de datos
console.log('DATABASE_URL:', process.env.DATABASE_URL);

if (!process.env.DATABASE_URL) {
    throw new Error(ERROR_MESSAGES.GENERAL.DB_URL_NOT_DEFINED);
}

// Configuración de Sequelize con opciones de pool
const sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: CONFIG.DIALECT,
    models: [__dirname + CONFIG.MODELS_PATH],
    logging: CONFIG.LOGGING,
    pool: {
        max: CONFIG.DATABASE_POOL_MAX_CONNECTIONS,     // Máximo de conexiones simultáneas
        min: CONFIG.DATABASE_POOL_MIN_CONNECTIONS,     // Mínimo de conexiones mantenidas
        idle: CONFIG.DATABASE_POOL_IDLE_TIME,         // Tiempo máximo de inactividad
        acquire: CONFIG.DATABASE_POOL_ACQUIRE_TIMEOUT // Tiempo máximo para obtener conexión
    }
});

// Manejo automático de reconexión tras pérdida de conexión
sequelize.addHook('afterDisconnect', async () => {
    console.log(ERROR_MESSAGES.GENERAL.DB_RECONNECTION_ERROR);
    try {
        await sequelize.authenticate();
        console.log(SUCCESS_MESSAGES.GENERAL.DB_RECONNECTION_SUCCESS);
    } catch (err) {
        console.error(ERROR_MESSAGES.GENERAL.DB_RECONNECTION_ERROR, err);
    }
});

// Función para establecer conexión inicial
export async function connectDb(): Promise<void> {
    try {
        await sequelize.authenticate();
        await sequelize.sync(); // Sincroniza los modelos con la base de datos
        console.log(colors.bgGreen.white(SUCCESS_MESSAGES.GENERAL.DB_CONNECTION_SUCCESS));
    } catch (error) {
        console.error(colors.bgRed.white(ERROR_MESSAGES.GENERAL.DB_CONNECTION_ERROR), error);
        throw error; // Propaga el error para manejo superior
    }
}

// Implementación del servicio de base de datos
class SequelizeDatabaseService implements DatabaseService {
    // Inicia una nueva transacción
    async transaction(): Promise<any> {
        return sequelize.transaction();
    }
}

// Exporta instancias para uso en la aplicación
export const dbService = new SequelizeDatabaseService();
export default sequelize;
