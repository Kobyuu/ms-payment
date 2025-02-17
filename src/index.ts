import 'reflect-metadata';
import { CONFIG, DYNAMIC_MESSAGES } from './config/constants';
import colors from 'colors';
import server from './server';
import { connectDb } from './config/db';

// Función principal para iniciar el servidor
async function startServer() {
  try {
    // Conecta a la base de datos
    await connectDb();

    // Inicia el servidor HTTP en el puerto configurado
    server.listen(CONFIG.PORT, () => {
      console.log(colors.cyan.bold(DYNAMIC_MESSAGES.SERVER_START(CONFIG.PORT)));
    });
  } catch (err) {
    // Manejo de errores específicos
    if (err instanceof Error) {
      console.error(colors.bgRed.white(err.message));
    } else {
      console.error(colors.bgRed.white(String(err)));
    }
    // Finaliza el proceso si la conexión falla
    process.exit(1);
  }
}

// Inicia la aplicación
startServer();