# Microservicio de Pagos

Este es un microservicio de pagos desarrollado con **Node.js, Express y TypeScript**. Se encarga de procesar pagos en la plataforma de e-commerce, verificando la disponibilidad de stock, calculando el precio total, registrando el pago y actualizando el inventario.

## Instalación

1. Clona el repositorio:
   ```sh
   git clone https://github.com/TuUsuario/ms-payment.git
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
   OUTPUT_STOCK=2
   PORT=3000
   ```

## Uso sin Docker

1. Inicia el servidor:
   ```sh
   npm run dev
   ```
2. El servidor estará disponible en `http://localhost:3000`.

## Uso con Docker

1. Asegúrate de tener **Docker** instalado.
2. Construye la imagen y levanta los contenedores con:
   ```sh
   docker-compose up --build
   ```
3. El servidor estará disponible en `http://localhost:3000`.
4. Para detener los contenedores:
   ```sh
   docker-compose down
   ```

## Rutas de la API

- **POST** `/api/payments`: Procesa un nuevo pago.
- **GET** `/api/payments`: Obtiene todos los pagos.
- **GET** `/api/payments/:id`: Obtiene un pago por su ID.
- **DELETE** `/api/payments/:paymentId`: Revierte un pago existente.

## Mensajes de error

Los mensajes de error están centralizados en la carpeta `config/errors`.

