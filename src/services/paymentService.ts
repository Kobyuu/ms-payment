import sequelize from '../config/db';
import Payments from '../models/Payment.model';
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '../config/constants';
import { Payment } from '../types/types';
import { calculateTotalPrice } from '../utils/utils';
import { breakers } from '../middleware/circuitBreaker';

class PaymentService {
  static async getPayments(): Promise<Payment[]> {
    return breakers.getAllPayments.fire(async () => {
      try {
        return Payments.findAll();
      } catch (error) {
        console.error(ERROR_MESSAGES.PAYMENT.GET_PAYMENTS_ERROR, error);
        throw new Error(ERROR_MESSAGES.PAYMENT.GET_PAYMENTS_ERROR);
      }
    });
  }

  static async getPaymentById(id: number): Promise<Payment | null> {
    return breakers.getPaymentById.fire(async () => {
      try {
        return Payments.findByPk(id);
      } catch (error) {
        console.error(ERROR_MESSAGES.PAYMENT.GET_PAYMENTS_ERROR, error);
        throw new Error(ERROR_MESSAGES.PAYMENT.GET_PAYMENTS_ERROR);
      }
    });
  }

  static async processPayment(product_id: number, quantity: number, payment_method: string): Promise<Payment> {
    return breakers.processPayment.fire(async () => {
      const transaction = await sequelize.transaction();
      try {
        const price = 100; // Asume un precio fijo o cámbialo según tus necesidades
        const total = calculateTotalPrice(price, quantity);

        const newPayment = await Payments.create(
          {
            product_id,
            price: total,
            payment_method,
          },
          { transaction }
        );

        await transaction.commit();
        return newPayment;
      } catch (error) {
        await transaction.rollback();
        console.error(ERROR_MESSAGES.PAYMENT.PROCESS_ERROR, error);
        throw new Error(ERROR_MESSAGES.PAYMENT.PROCESS_ERROR);
      }
    });
  }

  static async compensatePayment(paymentId: number): Promise<string> {
    return breakers.compensatePayment.fire(async () => {
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
    });
  }
}

export default PaymentService;