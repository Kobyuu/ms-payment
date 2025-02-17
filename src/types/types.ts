// Interfaz para pagos - Define estructura de un pago
export interface Payment {
  id?: number;
  product_id: number;
  price: number;
  payment_method: string;
}

// Interfaz para respuestas de error
export interface ErrorResponse {
  message: string;
  error?: any;
}

// Interfaz para respuestas exitosas
export interface SuccessResponse {
  message: string;
  data?: any;
}

// Interfaz para servicios de caché
export interface CacheService {
  getFromCache(key: string): Promise<any>;
  setToCache(key: string, data: any): Promise<void>;
  clearCache(keys: string[]): Promise<void>;
}

// Interfaz para servicios de base de datos
export interface DatabaseService {
  transaction<T>(): Promise<T>; 
}

// Interfaz para productos
export interface IProduct {
  productId: number;
  name: string;
  price: number;
  activate: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

// Interfaz para respuestas de productos
export interface IProductResponse {
  data: IProduct;
  message?: string;
  error?: string;
  statusCode: number;
}

// Interfaz para configuración de Redis
export interface RedisConfig {
  host: string;
  port: number;
}