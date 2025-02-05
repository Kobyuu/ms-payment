import axios from 'axios';
import { ERROR_MESSAGES } from '../config/constants';
import { Payment } from '../types/types';
import { config } from '../config/constants/environment';

const { inventoryServiceUrl, productServiceUrl } = config;

export const fetchStock = async (product_id: number): Promise<any> => {
  try {
    const stockResponse = await axios.get(`${inventoryServiceUrl}/${product_id}`);
    return stockResponse.data;
  } catch (error) {
    throw new Error(ERROR_MESSAGES.PAYMENT.STOCK_FETCH_ERROR);
  }
};

export const fetchProduct = async (product_id: number): Promise<any> => {
  try {
    const productResponse = await axios.get(`${productServiceUrl}/${product_id}`);
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
    await axios.put(`${inventoryServiceUrl}/update`, {
      product_id,
      quantity,
      input_output: 2,
    });
  } catch (error) {
    throw new Error(ERROR_MESSAGES.PAYMENT.STOCK_NOT_AVAILABLE);
  }
};