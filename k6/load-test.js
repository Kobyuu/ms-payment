import http from 'k6/http';
import { check, sleep } from 'k6';
import { Counter, Rate } from 'k6/metrics';

// URLs y configuración
const BASE_URL = 'http://ms-payment_app:4003/api/payment';
const SUCCESS_MESSAGE = 'Pago revertido exitosamente. La compensación de inventario debe ser gestionada por el orquestador.';

// Métricas personalizadas
const successfulPayments = new Counter('successful_payments');
const successfulCompensations = new Counter('successful_compensations');
const failedCompensations = new Counter('failed_compensations');
const failedPayments = new Counter('failed_payments');
const successRate = new Rate('success_rate');

const headers = {
  'Content-Type': 'application/json',
  'Accept': 'application/json'
};

const params = {
  headers: headers,
  timeout: 30000 // Aumentado a 30s
};

export const options = {
  setupTimeout: '60s',
  scenarios: {
    payments: {
      executor: 'constant-arrival-rate',
      rate: 10,
      timeUnit: '1s',
      duration: '10s',
      preAllocatedVUs: 15,
      maxVUs: 30,
      startTime: '15s' // Aumentado para dar más tiempo de inicialización
    },
  },
  thresholds: {
    http_req_duration: ['p(95)<5000'],
    http_req_failed: ['rate<0.1'],
    success_rate: ['rate>0.9']
  },
};

// Función mejorada para reintentos con backoff exponencial
const retryRequest = (request, maxRetries = 3) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = request();
      // Verificar códigos específicos
      if (response.status === 200 || response.status === 201) {
        return response;
      }
      // Backoff exponencial más largo
      sleep(Math.min(Math.pow(2, i) * 0.2, 1));
    } catch (e) {
      console.error(`Error en intento ${i + 1}:`, e);
      if (i === maxRetries - 1) throw e;
      sleep(0.5);
    }
  }
  return request();
};

export function setup() {
  console.log('Iniciando prueba de carga...');
  for (let i = 10; i > 0; i--) { // Aumentado a 10 intentos
    const res = http.get(`${BASE_URL}/`);
    if (res.status === 200) {
      console.log('Servicio listo para pruebas');
      sleep(5); // Aumentado el tiempo de espera
      return true;
    }
    console.log(`Esperando servicio, intentos restantes: ${i}`);
    sleep(3);
  }
  throw new Error('Servicio no disponible');
}

export default function () {
  const payload = JSON.stringify({
    product_id: Math.floor(Math.random() * 3) + 1,
    quantity: Math.floor(Math.random() * 3) + 1,
    payment_method: ['tarjeta', 'paypal', 'transferencia bancaria'][Math.floor(Math.random() * 3)]
  });

  // 1. Crear pago
  const payment = retryRequest(() => 
    http.post(`${BASE_URL}/`, payload, params)
  );

  const paymentSuccess = check(payment, {
    'payment created successfully': (r) => r.status === 201,
    'payment has valid ID': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body && body.id > 0;
      } catch (e) {
        return false;
      }
    }
  });

  if (paymentSuccess) {
    successfulPayments.add(1);
    
    try {
      const paymentId = JSON.parse(payment.body).id;
      sleep(1); // Aumentado para dar tiempo al sistema

      // 2. Compensar pago
      const compensation = retryRequest(() => 
        http.del(`${BASE_URL}/${paymentId}`, null, params)
      );

      const compensationSuccess = check(compensation, {
        'compensation successful': (r) => {
          try {
            const body = JSON.parse(r.body);
            return r.status === 200 && body.message === SUCCESS_MESSAGE;
          } catch (e) {
            return false;
          }
        }
      });

      if (compensationSuccess) {
        successfulCompensations.add(1);
        successRate.add(1);
      } else {
        failedCompensations.add(1);
        successRate.add(0);
      }
    } catch (e) {
      console.error('Error en compensación:', e);
      failedCompensations.add(1);
      successRate.add(0);
    }
  }

  sleep(1); // Aumentado para mejor distribución de carga
}
