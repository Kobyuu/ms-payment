import http from 'k6/http';
import { check, sleep } from 'k6';
import { Counter, Rate } from 'k6/metrics';

// URLs y configuración
const BASE_URL = 'http://ms-payment_app:4003/api/payment';
const SUCCESS_MESSAGE = 'Pago revertido exitosamente. La compensación de inventario debe ser gestionada por el orquestador.';

// Métricas personalizadas
const successfulPayments = new Counter('successful_payments');
const failedPayments = new Counter('failed_payments');
const successRate = new Rate('success_rate');

const headers = {
  'Content-Type': 'application/json',
  'Accept': 'application/json'
};

const params = {
  headers: headers,
  timeout: 10000 // Reducido a 10s
};

export const options = {
  setupTimeout: '30s',
  scenarios: {
    payments: {
      executor: 'constant-arrival-rate',
      rate: 10,
      timeUnit: '1s',
      duration: '10s',
      preAllocatedVUs: 15,
      maxVUs: 30,
      startTime: '5s'
    },
  },
  thresholds: {
    http_req_duration: ['p(95)<3000'],
    http_req_failed: ['rate<0.1'],
    success_rate: ['rate>0.9']
  },
};

// Función mejorada para reintentos
const retryRequest = (request, maxRetries = 2) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = request();
      if (response.status < 500 && response.status !== 429) {
        return response;
      }
      // Backoff exponencial más corto
      sleep(Math.min(Math.pow(2, i) * 0.05, 0.5));
    } catch (e) {
      if (i === maxRetries - 1) throw e;
      sleep(0.1);
    }
  }
  return request();
};

export function setup() {
  for (let i = 5; i > 0; i--) {
    const res = http.get(`${BASE_URL}/`);
    if (res.status === 200) {
      console.log('Servicio listo para pruebas');
      sleep(1);
      return true;
    }
    console.log(`Esperando servicio, intentos restantes: ${i}`);
    sleep(2);
  }
  throw new Error('Servicio no disponible');
}

export default function () {
  const payload = JSON.stringify({
    product_id: Math.floor(Math.random() * 3) + 1,
    quantity: Math.floor(Math.random() * 3) + 1,
    payment_method: ['tarjeta', 'paypal', 'transferencia bancaria'][Math.floor(Math.random() * 3)]
  });

  // Crear pago
  const payment = retryRequest(() => 
    http.post(`${BASE_URL}/`, payload, params)
  );

  const paymentSuccess = check(payment, {
    'payment created successfully': (r) => r.status === 201,
    'payment has valid ID': (r) => {
      try {
        return JSON.parse(r.body).id > 0;
      } catch (e) {
        return false;
      }
    }
  });

  if (paymentSuccess) {
    successfulPayments.add(1);
    
    try {
      const paymentId = JSON.parse(payment.body).id;
      sleep(0.1); // Pequeña pausa

      // Compensar pago
      const compensation = retryRequest(() => 
        http.del(`${BASE_URL}/${paymentId}`, null, params)
      );

      check(compensation, {
        'compensation successful': (r) => 
          r.status === 200 && 
          JSON.parse(r.body).message === SUCCESS_MESSAGE
      });

      successRate.add(compensation.status === 200);
    } catch (e) {
      failedPayments.add(1);
    }
  } else {
    failedPayments.add(1);
  }

  sleep(0.1);
}
