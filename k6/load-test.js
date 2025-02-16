import http from 'k6/http';
import { check, sleep } from 'k6';
import { Counter } from 'k6/metrics';

// Métricas personalizadas
const successfulPayments = new Counter('successful_payments');
const failedPayments = new Counter('failed_payments');
const successfulCompensations = new Counter('successful_compensations');
const failedCompensations = new Counter('failed_compensations');

const BASE_URL = 'http://ms-payment_app:4003/api/payment';

const headers = {
  'Content-Type': 'application/json',
  'Accept': 'application/json'
};

// Configuración optimizada
export const options = {
  setupTimeout: '30s',
  scenarios: {
    payments: {
      executor: 'constant-arrival-rate',
      rate: 5,
      timeUnit: '1s',
      duration: '10s',
      preAllocatedVUs: 10,
      maxVUs: 20,
      startTime: '5s' // Reducido de 15s a 5s
    },
  },
  thresholds: {
    http_req_duration: ['p(95)<5000'],  // Reducido a 5s
    http_req_failed: ['rate<0.1'],
    successful_compensations: ['count>0'],
  },
};

// Función helper mejorada para retry
const retryRequest = (request, maxRetries = 3) => {
  let retries = 0;
  while (retries < maxRetries) {
    try {
      const response = request();
      // Loggear el body en caso de error 500
      if (response.status === 500) {
        console.error(`Error 500 response body: ${response.body}`);
      }
      if (response.status < 500) {
        return response;
      }
      console.log(`Retry ${retries + 1}: Status ${response.status}`);
      retries++;
      sleep(1); // Reducido a 1s
    } catch (e) {
      console.error(`Error en intento ${retries + 1}:`, e);
      retries++;
      sleep(1);
    }
  }
  return request();
};

export function setup() {
  console.log('Iniciando prueba de carga...');
  let retries = 5; // Reducido a 5 intentos
  while (retries > 0) {
    try {
      const res = http.get(`${BASE_URL}/`);
      if (res.status === 200) {
        console.log('Servicio listo');
        sleep(2); // Reducido a 2s
        return true;
      }
    } catch (e) {
      console.error(`Error en setup: ${e.message}`);
    }
    console.log(`Servicio no disponible, intentos restantes: ${retries}`);
    retries--;
    sleep(2);
  }
  throw new Error('Servicio no disponible después de varios intentos');
}

export default function () {
  // GET all payments
  const getAllPayments = retryRequest(() => 
    http.get(`${BASE_URL}/`, { headers })
  );

  check(getAllPayments, {
    'GET all payments status is 200': (r) => r.status === 200,
    'GET all payments returns array': (r) => {
      try {
        const body = JSON.parse(r.body);
        return Array.isArray(body.data || body);
      } catch (e) {
        console.error('Error parsing GET response:', e);
        return false;
      }
    },
  });

  sleep(1);

  // Payload para el POST
  const payload = JSON.stringify({
    product_id: Math.floor(Math.random() * 3) + 1,
    quantity: Math.floor(Math.random() * 5) + 1,
    payment_method: 'tarjeta',
    status: 'pending'
  });

  // POST payment con mejor manejo de errores
  const processPayment = retryRequest(() => 
    http.post(BASE_URL, payload, { headers })
  );

  if (processPayment.status === 500) {
    console.error(`Payment failed with body: ${processPayment.body}`);
    failedPayments.add(1);
    return;
  }

  const paymentSuccess = check(processPayment, {
    'POST process payment status is 201': (r) => r.status === 201,
    'POST process payment has valid response': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body && body.id;
      } catch (e) {
        console.error('Error parsing payment response:', e);
        return false;
      }
    },
  });

  if (paymentSuccess) {
    successfulPayments.add(1);
    try {
      const paymentId = JSON.parse(processPayment.body).id;
      
      // GET payment by id
      const getPayment = retryRequest(() => 
        http.get(`${BASE_URL}/${paymentId}`, { headers })
      );

      check(getPayment, {
        'GET payment by id status is 200': (r) => r.status === 200,
        'GET payment by id returns valid data': (r) => {
          try {
            const body = JSON.parse(r.body);
            return body && body.id === paymentId;
          } catch (e) {
            console.error('Error parsing GET by ID response:', e);
            return false;
          }
        },
      });

      sleep(1);
      
      // DELETE compensación
      const compensatePayment = retryRequest(() => 
        http.del(`${BASE_URL}/${paymentId}`, null, { headers })
      );

      check(compensatePayment, {
        'DELETE compensate payment success': (r) => {
          try {
            const body = JSON.parse(r.body);
            if (r.status === 200) {
              successfulCompensations.add(1);
              return true;
            }
            failedCompensations.add(1);
            return false;
          } catch (e) {
            console.error('Error parsing compensation response:', e);
            failedCompensations.add(1);
            return false;
          }
        },
      });
    } catch (e) {
      console.error('Error en compensación:', e);
      failedCompensations.add(1);
    }
  } else {
    failedPayments.add(1);
  }

  sleep(0.5);
}
