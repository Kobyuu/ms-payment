// microservicios/ms-payment/src/config/constants/messages.ts

export const MESSAGES = {
  VALIDATION: {
    REQUIRED_FIELDS: 'El ID del producto, la cantidad y el método de pago son obligatorios.',
    INVALID_PRODUCT_ID: 'El ID del producto debe ser un número válido y mayor que 0.',
    INVALID_QUANTITY: 'La cantidad debe ser un número mayor a 0.',
    INVALID_PAYMENT_METHOD: 'El método de pago no es válido.',
  },
  PAYMENT: {
    NOT_FOUND: 'Pago no encontrado',
    PROCESS_ERROR: 'Error al procesar el pago',
    STOCK_NOT_AVAILABLE: 'Stock no disponible',
    STOCK_FETCH_ERROR: 'No se pudo obtener el stock del producto',
    PRODUCT_FETCH_ERROR: 'No se pudo obtener la información del producto',
    REVERT_SUCCESS: 'Pago revertido exitosamente. La compensación de inventario debe ser gestionada por el orquestador.',
    REVERT_ERROR: 'Error al revertir el pago',
  },
  GENERAL: {
    DB_CONNECTION_SUCCESS: 'Conexión a la base de datos establecida exitosamente.',
    DB_CONNECTION_ERROR: 'No se pudo conectar a la base de datos:',
  },
};