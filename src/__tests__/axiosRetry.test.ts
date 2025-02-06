import axios from 'axios';
import axiosRetry from 'axios-retry';
import MockAdapter from 'axios-mock-adapter';
import { DYNAMIC_MESSAGES } from '../config/constants';
import { config } from '../config/constants/environment';
import redisClient from '../config/redis';

jest.mock('axios');
jest.mock('axios-retry');

describe('Axios Retry Tests', () => {
  let mock: MockAdapter;

  beforeEach(() => {
    jest.clearAllMocks();
    mock = new MockAdapter(axios);
    jest.spyOn(redisClient, 'get').mockResolvedValue(null);
    jest.spyOn(redisClient, 'setex').mockResolvedValue('OK');
    require('../config/axiosClient'); // Importa el archivo para que se ejecute la configuración
  });

  afterEach(() => {
    mock.reset();
    jest.clearAllMocks();
  });

  it('should configure axiosRetry with correct options', () => {
    expect(axiosRetry).toHaveBeenCalledWith(axios, {
      retries: config.retryCount,
      retryDelay: expect.any(Function),
      retryCondition: expect.any(Function),
    });
  });

  it('should log retry attempts', () => {
    console.log = jest.fn();

    const retryDelay = (axiosRetry as unknown as jest.Mock).mock.calls[0][1].retryDelay;
    retryDelay(2);

    expect(console.log).toHaveBeenCalledWith(DYNAMIC_MESSAGES.RETRY_ATTEMPT(2));
  });

  it('should retry on server errors and connection aborted', () => {
    const retryCondition = (axiosRetry as unknown as jest.Mock).mock.calls[0][1].retryCondition;

    expect(retryCondition({ response: { status: 500 } })).toBe(true);
    expect(retryCondition({ code: 'ECONNABORTED' })).toBe(true);
    expect(retryCondition({ response: { status: 400 } })).toBe(false);
  });

  it('should retry failed requests', async () => {
    let attemptCount = 0;
    const endpoint = '/test-endpoint';

    mock.onGet(endpoint).reply(() => {
      attemptCount++;
      if (attemptCount < 3) {
        return [500, {}];
      }
      return [200, { data: 'success' }];
    });

    try {
      const response = await axios.get(endpoint);
      expect(attemptCount).toBe(3);
      expect(response.status).toBe(200);
      expect(response.data.data).toBe('success');
    } catch (error) {
      fail('Should not throw an error');
    }
  });

  it('should use Redis cache for GET requests', async () => {
    const endpoint = '/cached-endpoint';
    const cachedData = { data: 'cached response' };

    // First request - no cache
    jest.spyOn(redisClient, 'get').mockResolvedValueOnce(null);
    mock.onGet(endpoint).replyOnce(200, cachedData);

    const response1 = await axios.get(endpoint);
    expect(response1.data).toEqual(cachedData);
    expect(redisClient.setex).toHaveBeenCalled();

    // Second request - cache
    jest.spyOn(redisClient, 'get').mockResolvedValueOnce(JSON.stringify(cachedData));

    const response2 = await axios.get(endpoint);
    expect(response2.data).toEqual(cachedData);
  });

  it('should handle network errors', async () => {
    const endpoint = '/network-error';
    mock.onGet(endpoint).networkError();

    await expect(axios.get(endpoint))
      .rejects
      .toThrow('Network Error');
  });

  afterAll(async () => {
    await redisClient.quit();
  });
});