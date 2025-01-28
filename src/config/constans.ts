// microservicios/ms-payment/src/config/constans.ts
import dotenv from 'dotenv';

dotenv.config();

export const INVENTORY_SERVICE_URL = process.env.INVENTORY_SERVICE_URL!;
export const PRODUCT_SERVICE_URL = process.env.PRODUCT_SERVICE_URL!;
export const RETRY_COUNT = parseInt(process.env.RETRY_COUNT!, 10);
export const OUTPUT_STOCK = parseInt(process.env.OUTPUT_STOCK!, 10);