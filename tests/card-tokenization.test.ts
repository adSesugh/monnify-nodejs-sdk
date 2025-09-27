import nock from 'nock';
import MonnifySDK from '../src';
import { getTestConfig } from './setup';

describe('Card Tokenization APIs', () => {
  let sdk: MonnifySDK;
  const mockConfig = getTestConfig();

  beforeEach(() => {
    sdk = new MonnifySDK(mockConfig);
    
    // Mock authentication
    nock(mockConfig.baseURL)
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

  afterEach(() => {
    nock.cleanAll();
  });

  describe('tokenizeCard', () => {
    const mockCardTokenRequest = {
      pan: '5060666666666666666',
      expiryMonth: '03',
      expiryYear: '50',
      cvv: '123',
      pin: '1234'
    };

    it('should tokenize card successfully', async () => {
      const mockResponse = {
        requestSuccessful: true,
        responseMessage: 'success',
        responseCode: '0',
        responseBody: {
          token: 'TKN_123456789',
          maskedPan: '506066******6666',
          expiryMonth: '03',
          expiryYear: '50',
          cardType: 'VERVE'
        }
      };

      nock(mockConfig.baseURL)
        .post('/api/v1/sdk/transactions/card/tokenize')
        .reply(200, mockResponse);

      const result = await sdk.tokenizeCard(mockCardTokenRequest);
      
      expect(result.requestSuccessful).toBe(true);
      expect(result.responseBody.token).toBe('TKN_123456789');
      expect(result.responseBody.maskedPan).toBe('506066******6666');
      expect(result.responseBody.cardType).toBe('VERVE');
    });
  });

  describe('chargeTokenizedCard', () => {
    it('should charge tokenized card successfully', async () => {
      const mockResponse = {
        requestSuccessful: true,
        responseMessage: 'success',
        responseCode: '0',
        responseBody: {
          transactionReference: 'TXN-123',
          paymentStatus: 'PAID',
          amountPaid: 10000
        }
      };

      nock(mockConfig.baseURL)
        .post('/api/v1/sdk/transactions/card/charge-token')
        .reply(200, mockResponse);

      const result = await sdk.chargeTokenizedCard('TKN_123456789', 10000, 'PAY-123');
      
      expect(result.requestSuccessful).toBe(true);
      expect(result.responseBody.paymentStatus).toBe('PAID');
      expect(result.responseBody.amountPaid).toBe(10000);
    });
  });
});