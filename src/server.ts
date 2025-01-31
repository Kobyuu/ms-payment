import express from 'express';
import router from './router';
import sequelize from './config/dbConfig';
import { config } from './config/config';

const server = express();


// Usar express.json() para analizar cuerpos JSON
server.use(express.json());

// Usar express.urlencoded() para analizar cuerpos URL-encoded
server.use(express.urlencoded({ extended: true }));

server.use('/api/payment', router);


export default server;