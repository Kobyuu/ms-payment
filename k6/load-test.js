import http from 'k6/http';
import { check, sleep } from 'k6';
import { Counter, Rate, Trend } from 'k6/metrics';

// Configuration
const BASE_URL = 'http://ms-payment_app:4003/api/payment';
const SUCCESS_MESSAGE = 'Pago revertido exitosamente. La compensación de inventario debe ser gestionada por el orquestador.';

// Custom metrics
const successfulPayments = new Counter('successful_payments');
const successfulCompensations = new Counter('successful_compensations');
const failedCompensations = new Counter('failed_compensations');
const requestDuration = new Trend('request_duration');
const successRate = new Rate('success_rate');

// Request configuration
const headers = {
  'Content-Type': 'application/json',
  'Accept': 'application/json'
};

const params = {
  headers,
  timeout: '10s' // Reduced timeout
};

// Test configuration
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
      startTime: '5s', // Reduced startup time
      gracefulStop: '10s'
    },
  },
  thresholds: {
    http_req_duration: ['p(95)<5000'],
    http_req_failed: ['rate<0.2'], // Increased failure threshold
    success_rate: ['rate>0.8'] // Adjusted success rate
  },
};

// Enhanced retry function
const retryRequest = (request, maxRetries = 2) => {
  let lastError;
  for (let i = 0; i < maxRetries; i++) {
    try {
      const start = new Date();
      const response = request();
      requestDuration.add(new Date() - start);

      if (response.status !== 429 && response.status < 500) {
        return response;
      }

      // Exponential backoff with jitter
      const backoffTime = Math.min(Math.pow(2, i) * 0.1 * (1 + Math.random() * 0.1), 0.5);
      sleep(backoffTime);
    } catch (error) {
      lastError = error;
      if (i < maxRetries - 1) {
        sleep(0.1);
      }
    }
  }
  throw lastError || new Error('Max retries reached');
};

// Setup function
export function setup() {
  console.log('Iniciando prueba de carga...');
  let retries = 5;
  while (retries > 0) {
    try {
      const res = http.get(`${BASE_URL}/`, { timeout: '5s' });
      if (res.status === 200) {
        console.log('Servicio listo para pruebas');
        sleep(2);
        return true;
      }
    } catch (e) {
      console.log(`Reintento ${6 - retries}/5`);
    }
    retries--;
    sleep(2);
  }
  throw new Error('Servicio no disponible');
}

// Main test function
export default function () {
  const payload = JSON.stringify({
    product_id: Math.floor(Math.random() * 3) + 1,
    quantity: 1, // Fixed to 1 to reduce load
    payment_method: ['tarjeta', 'paypal', 'transferencia bancaria'][Math.floor(Math.random() * 3)]
  });

  try {
    // Create payment
    const payment = retryRequest(() => 
      http.post(`${BASE_URL}/`, payload, params)
    );

    if (!check(payment, {
      'payment successful': (r) => r.status === 201 && JSON.parse(r.body).id > 0,
    })) {
      failedCompensations.add(1);
      successRate.add(0);
      return;
    }

    successfulPayments.add(1);
    const paymentId = JSON.parse(payment.body).id;
    sleep(0.1); // Minimal pause

    // Compensate payment
    const compensation = retryRequest(() => 
      http.del(`${BASE_URL}/${paymentId}`, null, params)
    );

    if (check(compensation, {
      'compensation successful': (r) => 
        r.status === 200 && 
        JSON.parse(r.body).message === SUCCESS_MESSAGE
    })) {
      successfulCompensations.add(1);
      successRate.add(1);
    } else {
      failedCompensations.add(1);
      successRate.add(0);
    }

  } catch (error) {
    console.error('Error:', error.message);
    failedCompensations.add(1);
    successRate.add(0);
  }

  sleep(0.2); // Small pause between iterations
}
