import sequelize from '../config/db';
import Payments from '../models/Payment.model';
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '../config/constants';
import { Payment } from '../types/types';
import { calculateTotalPrice } from '../utils/utils';
import ProductService from './productService';

class PaymentService {
  static async getPayments(): Promise<Payment[]> {
    try {
      return Payments.findAll();
    } catch (error) {
      console.error(ERROR_MESSAGES.PAYMENT.GET_PAYMENTS_ERROR, error);
      throw new Error(ERROR_MESSAGES.PAYMENT.GET_PAYMENTS_ERROR);
    }
  }

  static async getPaymentById(id: number): Promise<Payment | null> {
    try {
      return Payments.findByPk(id);
    } catch (error) {
      console.error(ERROR_MESSAGES.PAYMENT.GET_PAYMENTS_ERROR, error);
      throw new Error(ERROR_MESSAGES.PAYMENT.GET_PAYMENTS_ERROR);
    }
  }

  static async processPayment(product_id: number, quantity: number, payment_method: string): Promise<Payment> {
    const transaction = await sequelize.transaction();
    try {
      // Validate quantity first
      if (!quantity || isNaN(quantity) || quantity <= 0) {
        await transaction.rollback();
        throw new Error(ERROR_MESSAGES.VALIDATION.INVALID_QUANTITY);
      }

      const productResponse = await ProductService.getProductById(product_id);
      
      if (!productResponse.data) {
        throw new Error(ERROR_MESSAGES.PAYMENT.PRODUCT_FETCH_ERROR);
      }

      const price = productResponse.data.data.price;

      // Validación de precio
      if (typeof price !== 'number' || isNaN(price) || price <= 0) {
        await transaction.rollback();
        throw new Error(ERROR_MESSAGES.PAYMENT.INVALID_PRICE);
      }

      const total = calculateTotalPrice(price, quantity);
      
      const newPayment = await Payments.create({
        product_id,
        price: total,
        payment_method
      }, { transaction });

      await transaction.commit();
      return newPayment;
    } catch (error) {
      await transaction.rollback();
      console.error('Payment processing error:', error);
      throw new Error(ERROR_MESSAGES.PAYMENT.PROCESS_ERROR);
    }
  }

  static async compensatePayment(paymentId: number): Promise<string> {
    const transaction = await sequelize.transaction();
    try {
      const payment = await Payments.findByPk(paymentId, { transaction });

      if (!payment) {
        await transaction.rollback();
        throw new Error(ERROR_MESSAGES.PAYMENT.NOT_FOUND);
      }

      await payment.destroy({ transaction });
      await transaction.commit();
      return SUCCESS_MESSAGES.PAYMENT.REVERT_SUCCESS;
    } catch (error) {
      await transaction.rollback();
      console.error(ERROR_MESSAGES.PAYMENT.REVERT_ERROR, error);
      throw new Error(ERROR_MESSAGES.PAYMENT.REVERT_ERROR);
    }
  }
}

export default PaymentService;