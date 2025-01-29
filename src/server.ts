import express from 'express';
import router from './router';
import sequelize from './config/dbConfig';
import { config } from './config/config';

const app = express();
const PORT = config.port || 3000;

// Usar express.json() para analizar cuerpos JSON
app.use(express.json());

// Usar express.urlencoded() para analizar cuerpos URL-encoded
app.use(express.urlencoded({ extended: true }));

app.use('/api', router);

sequelize.authenticate()
  .then(() => {
    console.log('Conexión a la base de datos establecida exitosamente.');
    app.listen(PORT, () => {
      console.log(`Servidor corriendo en el puerto ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('No se pudo conectar a la base de datos:', err);
  });

export default app;