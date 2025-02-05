export const ERROR_MESSAGES = {
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
    REVERT_ERROR: 'Error al revertir el pago',
    VALIDATION_ERROR: 'Error de validación en el controlador: Campos obligatorios faltantes',
  },
  GENERAL: {
    DB_CONNECTION_ERROR: 'No se pudo conectar a la base de datos:',
    ENV_VAR_NOT_DEFINED: 'Variable de entorno no definida',
    SERVICE_UNAVAILABLE: 'Servicio no disponible',
  },
  REDIS: {
    CONNECTION_ERROR: 'Error al conectar con Redis:',
  },
};

export const SUCCESS_MESSAGES = {
  PAYMENT: {
    REVERT_SUCCESS: 'Pago revertido exitosamente. La compensación de inventario debe ser gestionada por el orquestador.',
  },
  GENERAL: {
    DB_CONNECTION_SUCCESS: 'Conexión a la base de datos establecida exitosamente.',
  },
  REDIS: {
    CONNECTION_SUCCESS: 'Conexión a Redis establecida exitosamente.',
  },
};

export const DYNAMIC_MESSAGES = {
  RETRY_ATTEMPT: (retryCount: number) => `Intento de reintento: ${retryCount}`,
};