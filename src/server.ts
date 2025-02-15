import express from 'express';
import router from './router';
import limiter from './middleware/rateLimiter';

const server = express();

// Usar express.json() para analizar cuerpos JSON
server.use(express.json());

// Usar express.urlencoded() para analizar cuerpos URL-encoded
server.use(express.urlencoded({ extended: true }));

// Middleware de limitación de tasa
server.use(limiter);

// Rutas del API de pagos
server.use('/api/payment', router);


export default server;