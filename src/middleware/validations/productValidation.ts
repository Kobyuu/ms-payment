import { IProduct, IProductResponse } from '../../types/types';
import { HTTP_STATUS, ERROR_MESSAGES } from '../../config/constants';

export class ProductValidationMiddleware {
  static createErrorResponse(error: string, statusCode: number): IProductResponse {
    return {
      data: {} as IProduct,
      error,
      statusCode
    };
  }

  static createSuccessResponse(data: IProduct): IProductResponse {
    return {
      data,
      statusCode: HTTP_STATUS.OK
    };
  }

  static validateProduct(product: IProduct | null): IProductResponse {
    if (!product) {
      return this.createErrorResponse(ERROR_MESSAGES.PAYMENT.PRODUCT_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }
    return this.createSuccessResponse(product);
  }
}