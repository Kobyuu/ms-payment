import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import axiosClient from '../config/axiosClient';
import { cacheService } from '../services/redisCacheService';

// Mockear el servicio de caché para pruebas
jest.mock('../services/redisCacheService');

describe('axios-retry with cache', () => {
  let mock: MockAdapter;

  // Inicializa mock para interceptar solicitudes HTTP
  beforeEach(() => {
    mock = new MockAdapter(axiosClient);
    jest.clearAllMocks();
  });

  // Limpia el estado del mock entre pruebas
  afterEach(() => {
    mock.reset();
  });

  // Prueba reintentos en errores de red
  it('should retry the request on network error', async () => {
    mock.onGet('/test').networkError();

    try {
      await axiosClient.get('/test');
    } catch (error) {
      if (axios.isAxiosError(error)) {
        // Verifica error de red
        expect(error.message).toBe('Network Error');
        // Confirma múltiples intentos
        expect(mock.history.get.length).toBeGreaterThan(1);
      } else {
        throw error;
      }
    }
  });

  // Prueba reintentos en errores 5xx
  it('should retry the request on 5xx error', async () => {
    mock.onGet('/test').reply(500);

    try {
      await axiosClient.get('/test');
    } catch (error) {
      if (axios.isAxiosError(error)) {
        // Verifica error 500
        expect(error.message).toBe('Request failed with status code 500');
        // Confirma reintentos
        expect(mock.history.get.length).toBeGreaterThan(1);
      } else {
        throw error;
      }
    }
  });

  // Prueba sin reintentos en errores 4xx
  it('should not retry the request on 4xx error', async () => {
    mock.onGet('/test').reply(400);

    try {
      await axiosClient.get('/test');
    } catch (error) {
      if (axios.isAxiosError(error)) {
        // Verifica error 400
        expect(error.message).toBe('Request failed with status code 400');
        // Confirma un solo intento
        expect(mock.history.get.length).toBe(1);
      } else {
        throw error;
      }
    }
  });

  // Prueba almacenamiento en caché
  it('should store response in cache on successful request', async () => {
    const responseData = { data: 'test data' };
    mock.onGet('/test').reply(200, responseData);

    await axiosClient.get('/test');

    // Verifica guardado en caché
    expect(cacheService.setToCache).toHaveBeenCalledWith('cache:/test', responseData);
  });

  // Prueba recuperación desde caché
  it('should return cached response if available', async () => {
    const cachedData = { data: 'cached data' };
    (cacheService.getFromCache as jest.Mock).mockResolvedValue(cachedData);

    const response = await axiosClient.get('/test');

    // Verifica uso de caché
    expect(cacheService.getFromCache).toHaveBeenCalledWith('cache:/test');
    expect(response.data).toEqual(cachedData);
  });

  // Prueba solicitud de red sin caché
  it('should make network request if cache is empty', async () => {
    const responseData = { data: 'test data' };
    (cacheService.getFromCache as jest.Mock).mockResolvedValue(null);
    mock.onGet('/test').reply(200, responseData);

    const response = await axiosClient.get('/test');

    // Verifica flujo completo
    expect(cacheService.getFromCache).toHaveBeenCalledWith('cache:/test');
    expect(response.data).toEqual(responseData);
    expect(cacheService.setToCache).toHaveBeenCalledWith('cache:/test', responseData);
  });
});