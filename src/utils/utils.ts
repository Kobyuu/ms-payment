import axios from 'axios';
import { ERROR_MESSAGES } from '../config/constants';
import { CONFIG } from '../config/constants/environment';

const { INVENTORY_SERVICE_URL, PRODUCT_SERVICE_URL } = CONFIG;

export const fetchStock = async (product_id: number): Promise<any> => {
  try {
    const stockResponse = await axios.get(`${INVENTORY_SERVICE_URL}/${product_id}`);
    return stockResponse.data;
  } catch (error) {
    throw new Error(ERROR_MESSAGES.PAYMENT.STOCK_FETCH_ERROR);
  }
};

export const fetchProduct = async (product_id: number): Promise<any> => {
  try {
    const productResponse = await axios.get(`${PRODUCT_SERVICE_URL}/${product_id}`);
    return productResponse.data;
  } catch (error) {
    throw new Error(ERROR_MESSAGES.PAYMENT.PRODUCT_FETCH_ERROR);
  }
};

export const calculateTotalPrice = (price: number, quantity: number): number => {
  return price * quantity;
};

export const updateInventory = async (product_id: number, quantity: number): Promise<void> => {
  try {
    await axios.put(`${INVENTORY_SERVICE_URL}/update`, {
      product_id,
      quantity,
      input_output: 2,
    });
  } catch (error) {
    throw new Error(ERROR_MESSAGES.PAYMENT.STOCK_NOT_AVAILABLE);
  }
};