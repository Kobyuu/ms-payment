import dotenv from 'dotenv';

dotenv.config();

export const INVENTORY_SERVICE_URL = process.env.INVENTORY_SERVICE_URL!;
export const PRODUCT_SERVICE_URL = process.env.PRODUCT_SERVICE_URL!;