import sequelize from '../config/db';
import Payments from '../models/Payment.model';
import { ERROR_MESSAGES, SUCCESS_MESSAGES, HTTP_STATUS } from '../config/constants';
import { Payment } from '../types/types';
import { calculateTotalPrice } from '../utils/utils';
import ProductService from './productService';

class PaymentService {
  // Obtiene todos los pagos registrados
  static async getPayments(): Promise<Payment[]> {
    try {
      return Payments.findAll();
    } catch (error) {
      console.error(ERROR_MESSAGES.PAYMENT.GET_PAYMENTS_ERROR, error);
      throw new Error(ERROR_MESSAGES.PAYMENT.GET_PAYMENTS_ERROR);
    }
  }

  // Busca un pago específico por su ID
  static async getPaymentById(id: number): Promise<Payment | null> {
    try {
      return Payments.findByPk(id);
    } catch (error) {
      console.error(ERROR_MESSAGES.PAYMENT.GET_PAYMENTS_ERROR, error);
      throw new Error(ERROR_MESSAGES.PAYMENT.GET_PAYMENTS_ERROR);
    }
  }

  // Procesa un nuevo pago con transacción
  static async processPayment(product_id: number, quantity: number, payment_method: string): Promise<Payment> {
    const transaction = await sequelize.transaction();
    try {
      // Valida cantidad del producto
      if (!quantity || isNaN(quantity) || quantity <= 0) {
        await transaction.rollback();
        throw new Error(ERROR_MESSAGES.VALIDATION.INVALID_QUANTITY);
      }

      // Obtiene información del producto
      const productResponse = await ProductService.getProductById(product_id);
      
      // Verifica respuesta del servicio de productos
      if (productResponse.statusCode !== HTTP_STATUS.OK || !productResponse.data) {
        await transaction.rollback();
        throw new Error(ERROR_MESSAGES.PAYMENT.PRODUCT_NOT_FOUND);
      }

      const price = productResponse.data.price;
      
      // Valida precio del producto
      if (typeof price !== 'number' || isNaN(price) || price <= 0) {
        await transaction.rollback();
        throw new Error(ERROR_MESSAGES.PAYMENT.INVALID_PRICE);
      }

      // Calcula precio total
      const total = calculateTotalPrice(price, quantity);
      
      // Crea registro de pago
      const newPayment = await Payments.create({
        product_id,
        price: total,
        payment_method
      }, { transaction });

      await transaction.commit();
      return newPayment;
    } catch (error) {
      await transaction.rollback();
      console.error(ERROR_MESSAGES.PAYMENT.PROCESS_ERROR, error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error(ERROR_MESSAGES.PAYMENT.PROCESS_ERROR);
    }
  }

  // Compensa/revierte un pago existente
  static async compensatePayment(paymentId: number): Promise<string> {
    const transaction = await sequelize.transaction();
    try {
      // Busca el pago a compensar
      const payment = await Payments.findByPk(paymentId);
      if (!payment) {
        await transaction.rollback();
        throw new Error(ERROR_MESSAGES.PAYMENT.NOT_FOUND);
      }

      // Elimina el registro del pago
      await payment.destroy({ transaction });
      await transaction.commit();
      return SUCCESS_MESSAGES.PAYMENT.REVERT_SUCCESS;
    } catch (error) {
      await transaction.rollback();
      console.error(ERROR_MESSAGES.PAYMENT.REVERT_ERROR, error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error(ERROR_MESSAGES.PAYMENT.REVERT_ERROR);
    }
  }
}

export default PaymentService;