export interface Payment {
  id?: number;
  product_id: number;
  price: number;
  payment_method: string;
}

export interface ErrorResponse {
  message: string;
  error?: any;
}

export interface SuccessResponse {
  message: string;
  data?: any;
}