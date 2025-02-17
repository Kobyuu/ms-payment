import http from 'k6/http';
import { check, sleep } from 'k6';
import { Counter, Rate } from 'k6/metrics';

// Configuración base del test
const BASE_URL = 'http://ms-payment_app:4003/api/payment';
const SUCCESS_MESSAGE = 'Pago revertido exitosamente. La compensación de inventario debe ser gestionada por el orquestador.';

// Métricas personalizadas para monitoreo
const successfulPayments = new Counter('successful_payments');
const successfulCompensations = new Counter('successful_compensations');
const failedCompensations = new Counter('failed_compensations');
const failedPayments = new Counter('failed_payments');
const successRate = new Rate('success_rate');

// Configuración de cabeceras HTTP
const headers = {
  'Content-Type': 'application/json',
  'Accept': 'application/json'
};

// Parámetros de las peticiones
const params = {
  headers: headers,
  timeout: '15s'  // Tiempo límite reducido
};

// Configuración de escenarios de carga
export const options = {
  setupTimeout: '30s',
  scenarios: {
    payments: {
      executor: 'constant-arrival-rate',  // Tasa constante de llegada
      rate: 2,                           // 2 peticiones por segundo
      timeUnit: '1s',
      duration: '30s',
      preAllocatedVUs: 3,               // Usuarios virtuales inicial
      maxVUs: 6,                        // Máximo de usuarios virtuales
      startTime: '5s'
    },
  },
  thresholds: {
    http_req_duration: ['p(95)<2000'],  // Máximo 2s de respuesta
    http_req_failed: ['rate<0.05'],     // Máximo 5% de fallos
    success_rate: ['rate>0.95']         // Mínimo 95% de éxito
  },
};

// Función mejorada para reintentos de peticiones
const retryRequest = (request, maxRetries = 3) => {
  let lastError;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = request();
      
      // Manejo de límite de tasa
      if (response.status === 429) {
        sleep(1);
        continue;
      }
      
      // Verifica respuesta exitosa
      if (response.status >= 200 && response.status < 300) {
        return response;
      }
      
      // Retroceso exponencial con variación
      if (i < maxRetries - 1) {
        sleep(Math.min(0.5 * Math.pow(2, i) + Math.random() * 0.5, 2));
      }
    } catch (error) {
      lastError = error;
      if (i < maxRetries - 1) sleep(0.5);
    }
  }
  
  throw lastError || new Error(`Petición fallida después de ${maxRetries} intentos`);
};

// Función de inicialización del test
export function setup() {
  console.log('Iniciando prueba de carga...');
  const maxAttempts = 5;
  
  // Verifica disponibilidad del servicio
  for (let i = 0; i < maxAttempts; i++) {
    const res = http.get(`${BASE_URL}/`);
    if (res.status === 200) {
      console.log('Servicio listo para pruebas');
      sleep(2);
      return true;
    }
    console.log(`Esperando servicio... ${maxAttempts - i} intentos restantes`);
    sleep(2);
  }
  throw new Error('Servicio no disponible');
}

// Función principal de prueba
export default function() {
  // Preparar datos de pago aleatorios
  const payload = JSON.stringify({
    product_id: Math.floor(Math.random() * 3) + 1,
    quantity: 1,
    payment_method: ['tarjeta', 'paypal'][Math.floor(Math.random() * 2)]
  });

  try {
    // 1. Crear pago
    const payment = retryRequest(() => http.post(BASE_URL, payload, params));
    
    // Validar respuesta de creación
    if (!payment || payment.status !== 201) {
      failedPayments.add(1);
      return;
    }

    // Verificar éxito del pago
    const paymentSuccess = check(payment, {
      'pago creado exitosamente': (r) => r.status === 201,
      'pago tiene ID válido': (r) => {
        try {
          const body = JSON.parse(r.body);
          return body && body.id > 0;
        } catch (e) {
          return false;
        }
      }
    });

    // Procesar compensación si el pago fue exitoso
    if (paymentSuccess) {
      successfulPayments.add(1);
      const paymentId = JSON.parse(payment.body).id;
      
      sleep(0.5);

      // 2. Compensar pago
      const compensation = retryRequest(() => http.del(`${BASE_URL}/${paymentId}`, null, params));
      
      // Verificar éxito de la compensación
      const compensationSuccess = check(compensation, {
        'compensación exitosa': (r) => {
          try {
            const body = JSON.parse(r.body);
            return r.status === 200 && body.message === SUCCESS_MESSAGE;
          } catch (e) {
            return false;
          }
        }
      });

      // Actualizar métricas según resultado
      if (compensationSuccess) {
        successfulCompensations.add(1);
        successRate.add(1);
      } else {
        failedCompensations.add(1);
        successRate.add(0);
      }
    }
  } catch (error) {
    console.error(`Iteración de prueba fallida: ${error.message}`);
    failedPayments.add(1);
    successRate.add(0);
  }

  sleep(0.5);  // Tiempo de espera entre iteraciones
}
