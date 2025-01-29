import axios from 'axios';
import db from '../config/db';
import Payments from '../models/Payment.model';
import { config } from '../config/config';
import { MESSAGES } from '../config/constants/messages';

const { inventoryServiceUrl, productServiceUrl } = config;

class PaymentService {
  static async withRetries(action: () => Promise<any>, retries: number = 3): Promise<any> {
    let attempt = 0;
    while (attempt < retries) {
      try {
        return await action();
      } catch (error) {
        attempt++;
        if (attempt >= retries) {
          throw error;
        }
      }
    }
  }

  static async getPayments() {
    return Payments.findAll({
      attributes: { exclude: ['createdAt', 'updatedAt'] },
      order: [['createdAt', 'DESC']],
    });
  }

  static async getPaymentById(id: number) {
    return Payments.findByPk(id, {
      attributes: { exclude: ['createdAt', 'updatedAt'] },
    });
  }

  static async processPayment(product_id: number, quantity: number, payment_method: string) {
    const transaction = await db.transaction();

    try {
      const stockResponse = await PaymentService.withRetries(() =>
        axios.get(`${inventoryServiceUrl}/${product_id}`)
      );
      const stock = stockResponse.data;

      if (!stock) {
        throw new Error(MESSAGES.PAYMENT.STOCK_FETCH_ERROR);
      }

      const productResponse = await PaymentService.withRetries(() =>
        axios.get(`${productServiceUrl}/${product_id}`)
      );
      const product = productResponse.data;

      if (!product || !product.data) {
        throw new Error(MESSAGES.PAYMENT.PRODUCT_FETCH_ERROR);
      }

      if (stock.quantity < quantity) {
        await transaction.rollback();
        throw new Error(MESSAGES.PAYMENT.STOCK_NOT_AVAILABLE);
      }

      const price = product.data.price;
      const total = price * quantity;

      const newPayment = await Payments.create(
        {
          product_id,
          price: total,
          payment_method,
        },
        { transaction }
      );

      await PaymentService.withRetries(() =>
        axios.put(`${inventoryServiceUrl}/update`, {
          product_id,
          quantity,
          input_output: 2,
        })
      );

      await transaction.commit();
      return newPayment;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  static async compensatePayment(paymentId: number) {
    const transaction = await db.transaction();

    try {
      const payment = await PaymentService.withRetries(() => Payments.findByPk(paymentId, { transaction }), 3);

      if (!payment) {
        await transaction.rollback();
        throw new Error(MESSAGES.PAYMENT.NOT_FOUND);
      }

      await payment.destroy({ transaction });
      await transaction.commit();
      return MESSAGES.PAYMENT.REVERT_SUCCESS;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
}

export default PaymentService;