import MockAdapter from 'axios-mock-adapter';
import axiosClient from '../config/axiosClient';
import { cacheService } from '../services/redisCacheService';
import { ERROR_MESSAGES } from '../config/constants';
import { CONFIG } from '../config/constants/environment';
import redisClient from '../config/redisClient';

// Mock del servicio de caché
jest.mock('../services/redisCacheService', () => ({
  cacheService: {
    getFromCache: jest.fn(),
    setToCache: jest.fn(),
  },
}));

describe('axiosClient', () => {
  let mockAxios: MockAdapter;

  beforeEach(() => {
    mockAxios = new MockAdapter(axiosClient);
    jest.clearAllMocks();
  });

  afterEach(async () => {
    mockAxios.reset();
    await redisClient.quit(); // Cerrar la conexión a Redis después de cada test
  });

  describe('Interceptores y caché', () => {
    const testUrl = '/test';
    const testData = { id: 1, name: 'Test' };
    const cacheKey = `cache:${testUrl}`;

    it('debería devolver datos desde caché si están disponibles', async () => {
      (cacheService.getFromCache as jest.Mock).mockResolvedValueOnce(testData);

      const response = await axiosClient.get(testUrl);

      expect(response.data).toEqual(testData);
      expect(cacheService.getFromCache).toHaveBeenCalledWith(cacheKey);
      expect(cacheService.setToCache).not.toHaveBeenCalled();
    });

    it('debería hacer la petición HTTP y guardar en caché si no hay datos en caché', async () => {
      (cacheService.getFromCache as jest.Mock).mockResolvedValueOnce(null);
      mockAxios.onGet(testUrl).reply(200, testData); // Asegúrate de que el mock devuelva una respuesta exitosa

      const response = await axiosClient.get(testUrl);

      expect(response.data).toEqual(testData);
      expect(cacheService.getFromCache).toHaveBeenCalledWith(cacheKey);
      expect(cacheService.setToCache).toHaveBeenCalledWith(cacheKey, testData);
    });

    it('debería manejar un error 404 correctamente', async () => {
      (cacheService.getFromCache as jest.Mock).mockResolvedValueOnce(null);
      mockAxios.onGet(testUrl).reply(404); // Configura el mock para devolver un error 404

      await expect(axiosClient.get(testUrl)).rejects.toThrow('Request failed with status code 404');
    });
  });

  // Otros tests...
});