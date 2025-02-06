# Microservicio de Pagos

Este es un microservicio de pagos desarrollado con **Node.js, Express y TypeScript**. Se encarga de procesar pagos en la plataforma de e-commerce, verificando la disponibilidad de stock, calculando el precio total, registrando el pago y actualizando el inventario.

## Instalación

1. Clona el repositorio:
   ```sh
   git clone https://github.com/Kobyuu/ms-payment.git
   ```
2. Navega al directorio del proyecto:
   ```sh
   cd ms-payment
   ```
3. Instala las dependencias:
   ```sh
   npm install
   ```

## Configuración

1. Crea un archivo `.env` en la raíz del proyecto con el siguiente contenido:
   ```env
   # Configuración de la base de datos
   DATABASE_URL=postgres://postgres:banana@localhost:5432/ms-payment
   
   # URLs de otros microservicios
   INVENTORY_SERVICE_URL=http://localhost:4002/api/inventory
   PRODUCT_SERVICE_URL=http://localhost:4001/api/products
   
   # Configuraciones adicionales
   RETRY_COUNT=3
   RETRY_DELAY=1000
   OUTPUT_STOCK=2
   CACHE_EXPIRY=3600
   PORT=4003
   ```

## Uso sin Docker

1. Inicia el servidor:
   ```sh
   npm run dev
   ```
2. El servidor estará disponible en `http://localhost:4003`.

## Uso con Docker

1. Asegúrate de tener **Docker** instalado.
2. Construye la imagen y levanta los contenedores con:
   ```sh
   docker-compose up --build
   ```
3. El servidor estará disponible en `http://localhost:5003`.
4. Para detener los contenedores:
   ```sh
   docker-compose down
   ```

## Rutas de la API

- **POST** `/api/payment`: Procesa un nuevo pago.
- **GET** `/api/payment`: Obtiene todos los pagos.
- **GET** `/api/payment/:id`: Obtiene un pago por su ID.
- **DELETE** `/api/payment/:paymentId`: Revierte un pago existente.

## Pruebas

Este proyecto utiliza **Jest** para las pruebas unitarias e integradas. Para ejecutar las pruebas, utiliza el siguiente comando:

```sh
npm test
```

Las pruebas se encuentran en la carpeta `src/__tests__`.

## Mensajes de error

Los mensajes de error están centralizados en la carpeta `config/constants/messages.ts`.
