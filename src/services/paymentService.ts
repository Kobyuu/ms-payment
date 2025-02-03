import axios from '../config/axiosRetryConfig';
import sequelize from '../config/db';
import Payments from '../models/Payment.model';
import { config } from '../config/environment';
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '../config/constants';

const { inventoryServiceUrl, productServiceUrl } = config;

class PaymentService {
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
    const transaction = await sequelize.transaction();

    try {
      const stockResponse = await axios.get(`${inventoryServiceUrl}/${product_id}`);
      const stock = stockResponse.data;

      if (!stock) {
        throw new Error(ERROR_MESSAGES.PAYMENT.STOCK_FETCH_ERROR);
      }

      const productResponse = await axios.get(`${productServiceUrl}/${product_id}`);
      const product = productResponse.data;

      if (!product || !product.data) {
        throw new Error(ERROR_MESSAGES.PAYMENT.PRODUCT_FETCH_ERROR);
      }

      if (stock.quantity < quantity) {
        await transaction.rollback();
        throw new Error(ERROR_MESSAGES.PAYMENT.STOCK_NOT_AVAILABLE);
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

      await axios.put(`${inventoryServiceUrl}/update`, {
        product_id,
        quantity,
        input_output: 2,
      });

      await transaction.commit();
      return newPayment;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  static async compensatePayment(paymentId: number) {
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