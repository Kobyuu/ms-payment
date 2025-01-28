// microservicios/ms-payment/src/config/config.ts
import dotenv from 'dotenv';

dotenv.config();

export const config = {
  databaseUrl: process.env.DATABASE_URL!,
  inventoryServiceUrl: process.env.INVENTORY_SERVICE_URL!,
  productServiceUrl: process.env.PRODUCT_SERVICE_URL!,
  retryCount: parseInt(process.env.RETRY_COUNT!, 10),
  outputStock: parseInt(process.env.OUTPUT_STOCK!, 10),
  port: parseInt(process.env.PORT!, 10),
};