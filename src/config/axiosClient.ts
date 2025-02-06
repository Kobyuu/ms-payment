import axios from 'axios';
import axiosRetry from 'axios-retry';
import { DYNAMIC_MESSAGES } from './constants';
import { CONFIG } from './constants/environment';

axiosRetry(axios, {
  retries: CONFIG.RETRY_COUNT,
  retryDelay: (retryCount) => {
    console.log(DYNAMIC_MESSAGES.RETRY_ATTEMPT(retryCount));
    return retryCount * CONFIG.RETRY_DELAY;
  },
  retryCondition: (error) => {
    return (error.response?.status ?? 0) >= 500 || error.code === 'ECONNABORTED';
  },
});

export default axios;