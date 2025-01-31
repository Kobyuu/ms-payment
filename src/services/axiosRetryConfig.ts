import axios from 'axios';
import axiosRetry from 'axios-retry';
import { DYNAMIC_MESSAGES } from '../config/constants/messages';

axiosRetry(axios, {
  retries: 3, // Número de reintentos
  retryDelay: (retryCount) => {
    console.log(DYNAMIC_MESSAGES.RETRY_ATTEMPT(retryCount));
    return retryCount * 1000; // Retraso entre reintentos (en milisegundos)
  },
  retryCondition: (error) => {
    // Reintentar solo si el error es de tipo 5xx o de red
    return error.response?.status >= 500 || error.code === 'ECONNABORTED';
  },
});

export default axios;