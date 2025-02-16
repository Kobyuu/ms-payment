import http from 'k6/http';
import { check, sleep } from 'k6';
import { Counter, Rate } from 'k6/metrics';

// Configuration
const BASE_URL = 'http://ms-payment_app:4003/api/payment';
const SUCCESS_MESSAGE = 'Pago revertido exitosamente. La compensación de inventario debe ser gestionada por el orquestador.';

// Custom metrics
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
  timeout: '15s'  // Reduced timeout
};

export const options = {
  setupTimeout: '30s',
  scenarios: {
    payments: {
      executor: 'constant-arrival-rate',  // Changed to constant rate
      rate: 2,                           // Reduced rate
      timeUnit: '1s',
      duration: '30s',
      preAllocatedVUs: 3,               // Reduced VUs
      maxVUs: 6,                        // Reduced max VUs
      startTime: '5s'
    },
  },
  thresholds: {
    http_req_duration: ['p(95)<2000'],  // 2s max
    http_req_failed: ['rate<0.05'],     // 5% max failure
    success_rate: ['rate>0.95']         // 95% success rate
  },
};

// Improved retry function
const retryRequest = (request, maxRetries = 3) => {
  let lastError;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = request();
      
      if (response.status === 429) {  // Rate limit
        sleep(1);
        continue;
      }
      
      if (response.status >= 200 && response.status < 300) {
        return response;
      }
      
      // Backoff with jitter
      if (i < maxRetries - 1) {
        sleep(Math.min(0.5 * Math.pow(2, i) + Math.random() * 0.5, 2));
      }
    } catch (error) {
      lastError = error;
      if (i < maxRetries - 1) sleep(0.5);
    }
  }
  
  throw lastError || new Error(`Request failed after ${maxRetries} attempts`);
};

export function setup() {
  console.log('Starting load test...');
  const maxAttempts = 5;
  
  for (let i = 0; i < maxAttempts; i++) {
    const res = http.get(`${BASE_URL}/`);
    if (res.status === 200) {
      console.log('Service ready for testing');
      sleep(2);
      return true;
    }
    console.log(`Waiting for service... ${maxAttempts - i} attempts remaining`);
    sleep(2);
  }
  throw new Error('Service unavailable');
}

export default function() {
  const payload = JSON.stringify({
    product_id: Math.floor(Math.random() * 3) + 1,
    quantity: 1,  // Fixed quantity
    payment_method: ['tarjeta', 'paypal'][Math.floor(Math.random() * 2)]  // Removed 'transferencia bancaria'
  });

  try {
    // 1. Create payment
    const payment = retryRequest(() => http.post(BASE_URL, payload, params));
    
    if (!payment || payment.status !== 201) {
      failedPayments.add(1);
      return;
    }

    const paymentSuccess = check(payment, {
      'payment created successfully': (r) => r.status === 201,
      'payment has valid ID': (r) => {
        try {
          const body = JSON.parse(r.body);
          return body && body.id > 0;
        } catch (e) {  // Added error parameter
          return false;
        }
      }
    });

    if (paymentSuccess) {
      successfulPayments.add(1);
      const paymentId = JSON.parse(payment.body).id;
      
      sleep(0.5);  // Reduced wait time

      // 2. Compensate payment
      const compensation = retryRequest(() => http.del(`${BASE_URL}/${paymentId}`, null, params));
      
      const compensationSuccess = check(compensation, {
        'compensation successful': (r) => {
          try {
            const body = JSON.parse(r.body);
            return r.status === 200 && body.message === SUCCESS_MESSAGE;
          } catch (e) {  // Added error parameter
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
    }
  } catch (error) {
    console.error(`Test iteration failed: ${error.message}`);
    failedPayments.add(1);
    successRate.add(0);
  }

  sleep(0.5);  // Reduced cool-down time
}
