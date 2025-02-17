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
   # Configuración de reintentos
   RETRY_COUNT=3                    # Número de intentos para operaciones fallidas
   RETRY_DELAY=1000                # Tiempo de espera entre reintentos (ms)

   # Configuración de inventario
   OUTPUT_STOCK=2                   # Cantidad predeterminada de stock de salida

   # Configuración de Redis
   REDIS_HOST='redis'              # Nombre del host del servidor Redis
   REDIS_PORT=6379                 # Puerto del servidor Redis
   REDIS_URL='redis://redis:6379'  # URL completa de conexión a Redis
   REDIS_RETRY_DELAY=2000          # Tiempo de espera para reconexión a Redis (ms)

   # Configuración del servidor
   PORT=4003                       # Puerto del servidor de la aplicación
   CACHE_EXPIRY=3600              # Tiempo de expiración del caché (segundos)

   # Configuración de base de datos
   DATABASE_URL='postgres://postgres:1234@postgres:5432/ms-payment'  # URL de conexión PostgreSQL
   DATABASE_POOL_MAX_CONNECTIONS=5     # Máximo de conexiones en el pool
   DATABASE_POOL_MIN_CONNECTIONS=1     # Mínimo de conexiones en el pool
   DATABASE_POOL_IDLE_TIME=600000     # Tiempo máximo de inactividad de conexión (ms)
   DATABASE_POOL_ACQUIRE_TIMEOUT=30000 # Tiempo máximo para obtener conexión (ms)

   # Configuración de servicios externos
   PRODUCT_SERVICE_URL='http://ms-catalog_app:4001/api/product'  # URL del servicio de productos
   PRODUCT_SERVICE_TIMEOUT=5000    # Tiempo límite para peticiones al servicio (ms)
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

## jest.config.js
```js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      tsconfig: 'tsconfig.json',
    }],
  },
  setupFilesAfterEnv: ['./jest.setup.js'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  testMatch: ['**/__tests__/**/*.test.(ts|tsx|js)'],
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov'],
};
```

## jest.setup.js
```js
// Configuración global para Jest
jest.setTimeout(30000); // Establece un tiempo de espera global de 30 segundos para las pruebas
```