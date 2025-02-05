import axios from 'axios';
import axiosRetry from 'axios-retry';
import { DYNAMIC_MESSAGES } from './constants';
import { config } from './constants/environment';

axiosRetry(axios, {
  retries: config.retryCount,
  retryDelay: (retryCount) => {
    console.log(DYNAMIC_MESSAGES.RETRY_ATTEMPT(retryCount));
    return retryCount * config.retryDelay;
  },
  retryCondition: (error) => {
    return error.response?.status >= 500 || error.code === 'ECONNABORTED';
  },
});

export default axios;