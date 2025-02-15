// Payment interface
export interface Payment {
  id?: number;
  product_id: number;
  price: number;
  payment_method: string;
}

// ErrorResponse interface
export interface ErrorResponse {
  message: string;
  error?: any;
}

// SuccessResponse interface
export interface SuccessResponse {
  message: string;
  data?: any;
}

// CacheService interface
export interface CacheService {
  getFromCache(key: string): Promise<any>;
  setToCache(key: string, data: any): Promise<void>;
  clearCache(keys: string[]): Promise<void>;
}

// DatabaseService interface
export interface DatabaseService {
  transaction<T>(): Promise<T>;
}

// Product interfaces
export interface IProduct {
  productId: number; 
  name: string;
  price: number;
  activate: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IProductResponse {
  data: IProduct;
  message?: string;
  error?: string;
  statusCode: number;
}

// RedisConfig interface
export interface RedisConfig {
  host: string;
  port: number;
}