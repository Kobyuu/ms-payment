import http from 'k6/http';
import { check, sleep } from 'k6';

const BASE_URL = 'http://ms-payment_app:4003/api/payment';

const headers = {
  'Content-Type': 'application/json',
  'Accept': 'application/json'
};

const params = {
  headers: headers,
  timeout: 10000  // 10s timeout
};

export const options = {
  setupTimeout: '30s',
  scenarios: {
    payments: {
      executor: 'constant-arrival-rate',
      rate: 30,              
      timeUnit: '1s',
      duration: '10s',
      preAllocatedVUs: 60,    
      maxVUs: 100,          
    },
  },
  thresholds: {
    http_req_duration: ['p(95)<2000'],
    http_req_failed: ['rate<0.1'],
  },
};

const retryRequest = (request, maxRetries = 3) => {
  let retries = 0;
  while (retries < maxRetries) {
    const response = request();
    if (response.status < 500) {
      return response;
    }
    retries++;
    sleep(1);
  }
  return request();
};

export default function () {
  const productId = Math.floor(Math.random() * 3) + 1;
  const quantity = Math.floor(Math.random() * 5) + 1;
  const paymentMethods = ['tarjeta', 'paypal', 'transferencia bancaria'];
  const randomPaymentMethod = paymentMethods[Math.floor(Math.random() * paymentMethods.length)];

  // GET: obtener todos los pagos
  const getAllPayments = retryRequest(() => 
    http.get(`${BASE_URL}/`, params)
  );
  check(getAllPayments, {
    'GET all payments status is 200': (r) => r.status === 200,
    'GET all payments returns array': (r) => {
      try {
        const body = JSON.parse(r.body);
        return Array.isArray(body.data || body);
      } catch (e) {
        console.error('Parse error:', e);
        return false;
      }
    },
  });

  sleep(Math.random() * 2 + 1);

  // GET: obtener pago por ID
  const getPayment = retryRequest(() => http.get(`${BASE_URL}/1`, params));
  check(getPayment, {
    'GET payment by id status is 200 or 404': (r) => r.status === 200 || r.status === 404,
  });

  sleep(Math.random() * 2 + 1);

  // POST: procesar nuevo pago
  const processPaymentPayload = JSON.stringify({
    product_id: productId,
    quantity: quantity,
    payment_method: randomPaymentMethod
  });

  const processPayment = retryRequest(() => http.post(
    `${BASE_URL}/`, 
    processPaymentPayload,
    params
  ));

  check(processPayment, {
    'POST process payment status is 201': (r) => r.status === 201,
    'POST process payment has valid response': (r) => {
      try {
        return JSON.parse(r.body) !== null;
      } catch (e) {
        return false;
      }
    },
  });

  sleep(Math.random() * 2 + 1);

  // DELETE: revertir pago (compensación)
  if (processPayment.status === 201) {
    try {
      const paymentId = JSON.parse(processPayment.body).id;
      const compensatePayment = retryRequest(() => 
        http.del(`${BASE_URL}/${paymentId}`, null, params)
      );

      check(compensatePayment, {
        'DELETE compensate payment status is 200': (r) => r.status === 200,
        'DELETE compensate payment success': (r) => {
          try {
            const body = JSON.parse(r.body);
            return body.message === 'Pago revertido exitosamente';
          } catch (e) {
            return false;
          }
        },
      });
    } catch (e) {
      console.error('Error compensating payment:', e);
    }
  }

  sleep(Math.random() * 2 + 1);
}
