export const ERROR_MESSAGES = {
  VALIDATION: {
    REQUIRED_FIELDS: 'El ID del producto, la cantidad, el precio y el método de pago son obligatorios.',
    INVALID_PRODUCT_ID: 'El ID del producto debe ser un número válido y mayor que 0.',
    INVALID_QUANTITY: 'La cantidad debe ser un número válido y mayor que 0',
    INVALID_PAYMENT_METHOD: 'El método de pago no es válido. Debe ser "tarjeta", "paypal" ó "transferencia bancaria"',
    INVALID_PRICE: 'El precio debe ser un número válido y no puede ser negativo.',
    INVALID_DATA: 'Datos inválidos',
  },
  PAYMENT: {
    NOT_FOUND: 'Pago no encontrado',
    PROCESS_ERROR: 'Error al procesar el pago',
    STOCK_NOT_AVAILABLE: 'Stock no disponible',
    STOCK_FETCH_ERROR: 'No se pudo obtener el stock del producto',
    PRODUCT_FETCH_ERROR: 'No se pudo obtener la información del producto',
    REVERT_ERROR: 'Error al revertir el pago',
    VALIDATION_ERROR: 'Error de validación en el controlador: Campos obligatorios faltantes',
    INVALID_PRICE: 'El precio del producto no es válido o es menor o igual a cero',
    GET_PAYMENTS_ERROR: 'Error en PaymentService.getPayments:',
    PRODUCT_NOT_FOUND: 'Producto no encontrado',
  },
  GENERAL: {
    DB_CONNECTION_ERROR: 'No se pudo conectar a la base de datos:',
    DB_URL_NOT_DEFINED: 'La URL de la base de datos no está definida',
    ENV_VAR_NOT_DEFINED: 'Variable de entorno no definida',
    SERVICE_UNAVAILABLE: 'Servicio no disponible temporalmente',
    RESOURCE_NOT_FOUND: 'El recurso solicitado no existe',
    HTTP_REQUEST: 'Error en la solicitud HTTP',
    RATE_LIMIT_EXCEEDED: 'Demasiadas solicitudes desde esta IP, por favor intente de nuevo más tarde.'
  },
  REDIS: {
    CONNECTION_ERROR: 'Error al conectar con Redis:',
    URL_PARSE: 'Error parsing Redis URL:',
  },
  RATE_LIMITER: {
    TOO_MANY_REQUESTS: 'Demasiadas solicitudes desde esta IP, por favor intente nuevamente más tarde.',
  },
};

export const SUCCESS_MESSAGES = {
  PAYMENT: {
    REVERT_SUCCESS: 'Pago revertido exitosamente. La compensación de inventario debe ser gestionada por el orquestador.',
    GET_PAYMENTS_SUCCESS: 'Pagos obtenidos exitosamente',
  },
  GENERAL: {
    DB_CONNECTION_SUCCESS: 'Conexión a la base de datos establecida exitosamente.',
    OK: 'OK',
  },
  REDIS: {
    CONNECTION_SUCCESS: 'Conexión a Redis establecida exitosamente.',
  },
};

export const DYNAMIC_MESSAGES = {
  RETRY_ATTEMPT: (retryCount: number) => `Intento de reintento: ${retryCount}`,
  SERVER_START: (port: number) => `REST API en el puerto ${port}`,
  PROCESSING_PAYMENT: (data: { product_id: number, quantity: number, payment_method: string }) => 
    `Procesando pago: ${JSON.stringify(data)}`,
  PRODUCT_NOT_FOUND: (id: number) => `Producto con ID ${id} no encontrado`,
};