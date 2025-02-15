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
   # Retry configuration
   RETRY_COUNT=3                    # Number of retry attempts for failed operations
   RETRY_DELAY=1000                # Delay between retries in milliseconds

   # Stock configuration
   OUTPUT_STOCK=2                   # Default output stock quantity

   # Redis configuration
   REDIS_HOST='redis'              # Redis server hostname
   REDIS_PORT=6379                 # Redis server port
   REDIS_URL='redis://redis:6379'  # Complete Redis connection URL
   REDIS_RETRY_DELAY=2000          # Redis reconnection delay in milliseconds

   # Server configuration
   PORT=4003                       # Application server port
   CACHE_EXPIRY=3600              # Cache expiration time in seconds

   # Database configuration
   DATABASE_URL='postgres://postgres:1234@postgres:5432/ms-payment'  # PostgreSQL connection URL
   DATABASE_POOL_MAX_CONNECTIONS=5     # Maximum number of connections in the pool
   DATABASE_POOL_MIN_CONNECTIONS=1     # Minimum number of connections in the pool
   DATABASE_POOL_IDLE_TIME=600000     # Maximum time (ms) that a connection can be idle
   DATABASE_POOL_ACQUIRE_TIMEOUT=30000 # Maximum time (ms) to acquire a connection

   # External services configuration
   PRODUCT_SERVICE_URL='http://ms-catalog_app:4001/api/product'  # Product service endpoint
   PRODUCT_SERVICE_TIMEOUT=5000    # Timeout for product service requests in milliseconds
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
