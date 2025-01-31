import express from 'express';
import router from './router';
import sequelize from './config/db';
import { config } from './config/config';
import { circuitBreakerMiddleware } from './middleware/circuitBreaker';
import { rateLimiter } from './middleware/rateLimiter';

const server = express();

// Usar express.json() para analizar cuerpos JSON
server.use(express.json());

// Usar express.urlencoded() para analizar cuerpos URL-encoded
server.use(express.urlencoded({ extended: true }));

// Middleware de limitación de tasa
server.use(rateLimiter);

// Middleware de circuito de interrupción
server.use(circuitBreakerMiddleware);

server.use('/api/payment', router);

// Conectar a la base de datos
sequelize.authenticate()
  .then(() => {
    console.log('Conexión a la base de datos establecida exitosamente.');
  })
  .catch((error) => {
    console.error('No se pudo conectar a la base de datos:', error);
  });

export default server;