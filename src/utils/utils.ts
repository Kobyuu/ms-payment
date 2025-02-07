import { ERROR_MESSAGES } from '../config/constants';

export const calculateTotalPrice = (price: number, quantity: number): number => {
  return price * quantity;
};