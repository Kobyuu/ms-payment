import axiosClient from '../config/axiosClient';
import { CONFIG } from '../config/constants/environment';
import { HTTP_STATUS, ERROR_MESSAGES } from '../config/constants';
import { cacheService } from './redisCacheService';

class ProductService {
  async getProductById(productId: number) {
    const cacheKey = `product:${productId}`;
    try {
      // Log para debug
      console.log('Fetching product:', productId);

      // Intentar obtener los datos desde la caché
      const cachedProduct = await cacheService.getFromCache(cacheKey);
      if (cachedProduct) {
        return { data: cachedProduct, statusCode: HTTP_STATUS.OK };
      }

      // Obtener los datos desde el servicio de productos
      const productResponse = await axiosClient.get(`${CONFIG.PRODUCT_SERVICE_URL}/${productId}`);
      console.log('Product response:', productResponse.data);

      if (productResponse.status === HTTP_STATUS.NOT_FOUND) {
        return { error: ERROR_MESSAGES.PAYMENT.PRODUCT_FETCH_ERROR, statusCode: HTTP_STATUS.NOT_FOUND };
      }

      // Almacenar los datos en la caché
      await cacheService.setToCache(cacheKey, productResponse.data);
      return { data: productResponse.data, statusCode: HTTP_STATUS.OK };
    } catch (error: any) {
      console.error('Product service error:', error);
      return { error: ERROR_MESSAGES.GENERAL.SERVICE_UNAVAILABLE, statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR };
    }
  }
}

export default new ProductService();