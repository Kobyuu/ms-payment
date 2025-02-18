import { IProduct, IProductResponse } from '../types/types';
import axiosClient from '../config/axiosClient';
import { HTTP_STATUS, ERROR_MESSAGES, CONFIG } from '../config/constants';
import { cacheService } from './redisCacheService';
import { ProductValidationMiddleware } from '../middleware/validations/productValidation';

class ProductService {
  // Obtiene un producto por su ID desde caché o API externa
  async getProductById(productId: number): Promise<IProductResponse> {
    const cacheKey = `product:${productId}`;
    try {
      // Intenta obtener producto desde caché
      const cachedProduct = await cacheService.getFromCache(cacheKey);
      if (cachedProduct) {
        // Valida estructura del producto en caché
        if (!this.isValidProduct(cachedProduct)) {
          return ProductValidationMiddleware.createErrorResponse(
            ERROR_MESSAGES.VALIDATION.INVALID_DATA,
            HTTP_STATUS.BAD_REQUEST
          );
        }
        const validationError = ProductValidationMiddleware.validateProduct(cachedProduct);
        if (validationError) return validationError;
        return ProductValidationMiddleware.createSuccessResponse(cachedProduct as IProduct);
      }

      // Obtiene producto desde API externa
      const productResponse = await axiosClient.get(`${CONFIG.PRODUCT_SERVICE_URL}/${productId}`);
      
      // Verifica existencia de datos
      if (!productResponse.data) {
        return ProductValidationMiddleware.createErrorResponse(
          ERROR_MESSAGES.PAYMENT.PRODUCT_NOT_FOUND,
          HTTP_STATUS.NOT_FOUND
        );
      }

      // Mapea respuesta a estructura de producto
      const product: IProduct = {
        productId: productResponse.data.data.id,
        name: productResponse.data.data.name,
        price: productResponse.data.data.price,
        activate: productResponse.data.data.activate
      };

      // Valida estructura del producto obtenido
      if (!this.isValidProduct(product)) {
        return ProductValidationMiddleware.createErrorResponse(
          ERROR_MESSAGES.VALIDATION.INVALID_DATA,
          HTTP_STATUS.BAD_REQUEST
        );
      }

      // Guarda producto en caché
      await cacheService.setToCache(cacheKey, product);
      return ProductValidationMiddleware.createSuccessResponse(product);
    } catch (error: any) {
      // Manejo de errores específicos
      if (error.response?.status === HTTP_STATUS.NOT_FOUND) {
        return ProductValidationMiddleware.createErrorResponse(
          ERROR_MESSAGES.PAYMENT.PRODUCT_NOT_FOUND, 
          HTTP_STATUS.NOT_FOUND
        );
      }
      console.error(ERROR_MESSAGES.GENERAL.HTTP_REQUEST, error);
      return ProductValidationMiddleware.createErrorResponse(
        ERROR_MESSAGES.GENERAL.HTTP_REQUEST, 
        HTTP_STATUS.INTERNAL_SERVER_ERROR
      );
    }
  }

  // Valida que un objeto tenga la estructura correcta de IProduct
  private isValidProduct(product: any): product is IProduct {
    return (
      product &&
      typeof product.productId === 'number' &&
      typeof product.name === 'string' &&
      typeof product.price === 'number' &&
      typeof product.activate === 'boolean'
    );
  }
}

export default new ProductService();