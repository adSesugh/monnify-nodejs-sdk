import nock from 'nock';
import MonnifySDK, { MonnifyError } from '../src';
import { getTestConfig } from './setup';

describe('Error Handling', () => {
  let sdk: MonnifySDK;
  const mockConfig = getTestConfig();

  beforeEach(() => {
    sdk = new MonnifySDK(mockConfig);
  });

  afterEach(() => {
    nock.cleanAll();
  });

  describe('MonnifyError', () => {
    it('should create error with message and code', () => {
      const error = new MonnifyError('Test error', 'TEST_CODE');
      
      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(MonnifyError);
      expect(error.message).toBe('Test error');
      expect(error.code).toBe('TEST_CODE');
      expect(error.name).toBe('MonnifyError');
    });

    it('should create error with status code', () => {
      const error = new MonnifyError('API error', 'API_ERROR', 400);
      
      expect(error.statusCode).toBe(400);
    });
  });

  describe('Network Errors', () => {
    it('should handle network timeout', async () => {
      nock('https://sandbox.monnify.com')
        .post('/api/v1/auth/login')
        .replyWithError({ code: 'ETIMEDOUT' });

      await expect(sdk.getBanks()).rejects.toThrow(MonnifyError);
    });

    it('should handle connection refused', async () => {
      nock('https://sandbox.monnify.com')
        .post('/api/v1/auth/login')
        .replyWithError({ code: 'ECONNREFUSED' });

      await expect(sdk.getBanks()).rejects.toThrow(MonnifyError);
    });

    it('should handle DNS errors', async () => {
      nock('https://sandbox.monnify.com')
        .post('/api/v1/auth/login')
        .replyWithError({ code: 'ENOTFOUND' });

      await expect(sdk.getBanks()).rejects.toThrow(MonnifyError);
    });
  });

  describe('HTTP Status Errors', () => {
    beforeEach(() => {
      // Mock successful authentication
      nock('https://sandbox.monnify.com')
        .post('/api/v1/auth/login')
        .reply(200, {
          requestSuccessful: true,
          responseMessage: 'success',
          responseCode: '0',
          responseBody: {
            accessToken: 'mock_token',
            expiresIn: 3600
          }
        })
        .persist();
    });

    it('should handle 400 Bad Request', async () => {
      nock('https://sandbox.monnify.com')
        .get('/api/v1/banks')
        .reply(400, {
          requestSuccessful: false,
          responseMessage: 'Bad request',
          responseCode: '400'
        });

      await expect(sdk.getBanks()).rejects.toThrow(MonnifyError);
    });

    it('should handle 401 Unauthorized', async () => {
      nock('https://sandbox.monnify.com')
        .get('/api/v1/banks')
        .reply(401, {
          requestSuccessful: false,
          responseMessage: 'Unauthorized',
          responseCode: '401'
        });

      await expect(sdk.getBanks()).rejects.toThrow(MonnifyError);
    });

    it('should handle 403 Forbidden', async () => {
      nock('https://sandbox.monnify.com')
        .get('/api/v1/banks')
        .reply(403, {
          requestSuccessful: false,
          responseMessage: 'Forbidden',
          responseCode: '403'
        });

      await expect(sdk.getBanks()).rejects.toThrow(MonnifyError);
    });

    it('should handle 404 Not Found', async () => {
      nock('https://sandbox.monnify.com')
        .get('/api/v1/banks')
        .reply(404, {
          requestSuccessful: false,
          responseMessage: 'Not found',
          responseCode: '404'
        });

      await expect(sdk.getBanks()).rejects.toThrow(MonnifyError);
    });

    it('should handle 500 Internal Server Error', async () => {
      nock('https://sandbox.monnify.com')
        .get('/api/v1/banks')
        .reply(500, {
          requestSuccessful: false,
          responseMessage: 'Internal server error',
          responseCode: '500'
        });

      await expect(sdk.getBanks()).rejects.toThrow(MonnifyError);
    });
  });

  describe('API Response Errors', () => {
    beforeEach(() => {
      // Mock successful authentication
      nock('https://sandbox.monnify.com')
        .post('/api/v1/auth/login')
        .reply(200, {
          requestSuccessful: true,
          responseMessage: 'success',
          responseCode: '0',
          responseBody: {
            accessToken: 'mock_token',
            expiresIn: 3600
          }
        })
        .persist();
    });

    it('should handle API failure response', async () => {
      nock('https://sandbox.monnify.com')
        .get('/api/v1/banks')
        .reply(200, {
          requestSuccessful: false,
          responseMessage: 'Service temporarily unavailable',
          responseCode: 'SERVICE_UNAVAILABLE'
        });

      await expect(sdk.getBanks()).rejects.toThrow(MonnifyError);
    });

    it('should handle malformed response', async () => {
      nock('https://sandbox.monnify.com')
        .get('/api/v1/banks')
        .reply(200, 'Invalid JSON response');

      await expect(sdk.getBanks()).rejects.toThrow();
    });
  });

  describe('Authentication Errors', () => {
    it('should handle authentication failure', async () => {
      nock('https://sandbox.monnify.com')
        .post('/api/v1/auth/login')
        .reply(200, {
          requestSuccessful: false,
          responseMessage: 'Invalid credentials',
          responseCode: 'INVALID_CREDENTIALS'
        });

      await expect(sdk.getBanks()).rejects.toThrow(MonnifyError);
    });

    it('should handle authentication request failure', async () => {
      nock('https://sandbox.monnify.com')
        .post('/api/v1/auth/login')
        .reply(500, 'Server error');

      await expect(sdk.getBanks()).rejects.toThrow(MonnifyError);
    });

    it('should handle malformed authentication response', async () => {
      nock('https://sandbox.monnify.com')
        .post('/api/v1/auth/login')
        .reply(200, 'Invalid response');

      await expect(sdk.getBanks()).rejects.toThrow();
    });
  });

  describe('Parameter Validation Errors', () => {
    it('should validate transaction reference parameter', async () => {
      await expect(sdk.getTransactionStatus('')).rejects.toThrow(MonnifyError);
      await expect(sdk.getTransactionStatus(null as any)).rejects.toThrow(MonnifyError);
      await expect(sdk.getTransactionStatus(undefined as any)).rejects.toThrow(MonnifyError);
    });

    it('should validate account reference parameter', async () => {
      await expect(sdk.getReservedAccountDetails('')).rejects.toThrow(MonnifyError);
      await expect(sdk.deleteReservedAccount('')).rejects.toThrow(MonnifyError);
    });

    it('should validate bank verification parameters', async () => {
      await expect(sdk.verifyBankAccount('', '123')).rejects.toThrow(MonnifyError);
      await expect(sdk.verifyBankAccount('044', '')).rejects.toThrow(MonnifyError);
    });

    it('should validate transfer reference parameter', async () => {
      await expect(sdk.getTransferStatus('')).rejects.toThrow(MonnifyError);
      await expect(sdk.getBulkTransferStatus('')).rejects.toThrow(MonnifyError);
    });

    it('should validate webhook signature parameters', () => {
      expect(() => sdk.verifyWebhookSignature('', 'signature')).toThrow(MonnifyError);
      expect(() => sdk.verifyWebhookSignature('payload', '')).toThrow(MonnifyError);
    });
  });
});