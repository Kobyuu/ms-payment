export const DEFAULTS = {
  RETRY_COUNT: 3,
  OUTPUT_STOCK: 2,
  REDIS_HOST: 'redis',
  REDIS_PORT: 6379,
  REDIS_RETRY_DELAY: 2000,
  PORT: 4003,
  RETRY_DELAY: 1000,
  CACHE_EXPIRY: 3600,
  DATABASE_URL: 'postgres://postgres:1234@postgres:5432/ms-payment',
  PRODUCT_SERVICE_URL: 'http://ms-catalog_app:4001/api/product',
  REDIS_URL: 'redis://redis:6379'
};