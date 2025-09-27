import nock from 'nock';
import MonnifySDK, { MonnifyError } from '../src';
import { getTestConfig } from './setup';

describe('MonnifySDK', () => {
  let sdk: MonnifySDK;
  const mockConfig = getTestConfig();

  beforeEach(() => {
    sdk = new MonnifySDK(mockConfig);
    nock.cleanAll();
  });

  afterEach(() => {
    nock.cleanAll();
  });

  describe('Constructor', () => {
    it('should create instance with valid configuration', () => {
      expect(sdk).toBeInstanceOf(MonnifySDK);
    });

    it('should throw error for missing contractCode', () => {
      expect(() => {
        new MonnifySDK({ ...mockConfig, contractCode: '' });
      }).toThrow(MonnifyError);
    });

    it('should throw error for missing secretKey', () => {
      expect(() => {
        new MonnifySDK({ ...mockConfig, secretKey: '' });
      }).toThrow(MonnifyError);
    });

    it('should throw error for missing apiKey', () => {
      expect(() => {
        new MonnifySDK({ ...mockConfig, apiKey: '' });
      }).toThrow(MonnifyError);
    });

    it('should use default baseURL when not provided', () => {
      const { baseURL, ...configWithoutURL } = mockConfig;
      const sdkWithoutURL = new MonnifySDK(configWithoutURL);
      expect(sdkWithoutURL).toBeInstanceOf(MonnifySDK);
    });
  });

  describe('Authentication', () => {
    it('should authenticate successfully', async () => {
      const authResponse = {
        requestSuccessful: true,
        responseMessage: 'success',
        responseCode: '0',
        responseBody: {
          accessToken: 'mock_token',
          expiresIn: 3600
        }
      };

      nock('https://sandbox.monnify.com')
        .post('/api/v1/auth/login')
        .reply(200, authResponse);

      nock('https://sandbox.monnify.com')
        .get('/api/v1/banks')
        .reply(200, {
          requestSuccessful: true,
          responseMessage: 'success',
          responseCode: '0',
          responseBody: []
        });

      await expect(sdk.getBanks()).resolves.toBeDefined();
    });

    it('should handle authentication failure', async () => {
      nock('https://sandbox.monnify.com')
        .post('/api/v1/auth/login')
        .reply(200, {
          requestSuccessful: false,
          responseMessage: 'Invalid credentials',
          responseCode: '99'
        });

      await expect(sdk.getBanks()).rejects.toThrow(MonnifyError);
    });
  });
});