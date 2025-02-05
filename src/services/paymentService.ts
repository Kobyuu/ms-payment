import sequelize from '../config/db';
import Payments from '../models/Payment.model';
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '../config/constants';
import { Payment } from '../types/types';
import { fetchStock, fetchProduct, calculateTotalPrice, updateInventory } from '../utils/utils';

class PaymentService {
  static async getPayments(): Promise<Payment[]> {
    try {
      return Payments.findAll({
        attributes: { exclude: ['createdAt', 'updatedAt'] },
        order: [['createdAt', 'DESC']],
      });
    } catch (error) {
      console.error('Error en PaymentService.getPayments:', error); // Imprime el error completo
      throw error;
    }
  }

  static async getPaymentById(id: number): Promise<Payment | null> {
    return Payments.findByPk(id, {
      attributes: { exclude: ['createdAt', 'updatedAt'] },
    });
  }

  static async processPayment(product_id: number, quantity: number, payment_method: string): Promise<Payment> {
    const transaction = await sequelize.transaction();

    try {
      const stock = await fetchStock(product_id);

      if (!stock) {
        throw new Error(ERROR_MESSAGES.PAYMENT.STOCK_FETCH_ERROR);
      }

      const product = await fetchProduct(product_id);

      if (!product || !product.data) {
        throw new Error(ERROR_MESSAGES.PAYMENT.PRODUCT_FETCH_ERROR);
      }

      if (stock.quantity < quantity) {
        await transaction.rollback();
        throw new Error(ERROR_MESSAGES.PAYMENT.STOCK_NOT_AVAILABLE);
      }

      const price = product.data.price;
      const total = calculateTotalPrice(price, quantity);

      const newPayment = await Payments.create(
        {
          product_id,
          price: total,
          payment_method,
        },
        { transaction }
      );

      await updateInventory(product_id, quantity);

      await transaction.commit();
      return newPayment;
    } catch (error) {
      await transaction.rollback();
      throw error;
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
      throw error;
    }
  }
}

export default PaymentService;