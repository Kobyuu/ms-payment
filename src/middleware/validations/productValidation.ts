import { IProduct, IProductResponse } from '../../types/types';
import { HTTP_STATUS, ERROR_MESSAGES } from '../../config/constants';

// Clase para validación de productos y generación de respuestas
export class ProductValidationMiddleware {
  // Crea respuesta para casos de error
  static createErrorResponse(error: string, statusCode: number): IProductResponse {
    return {
      data: {} as IProduct,
      error,
      statusCode
    };
  }

  // Crea respuesta para casos exitosos
  static createSuccessResponse(data: IProduct): IProductResponse {
    return {
      data,
      statusCode: HTTP_STATUS.OK
    };
  }

  // Valida existencia y estado del producto
  static validateProduct(product: IProduct | null): IProductResponse {
    if (!product) {
      return this.createErrorResponse(
        ERROR_MESSAGES.PAYMENT.PRODUCT_NOT_FOUND, 
        HTTP_STATUS.NOT_FOUND
      );
    }
    return this.createSuccessResponse(product);
  }
}