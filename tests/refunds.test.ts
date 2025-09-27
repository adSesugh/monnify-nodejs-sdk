import nock from 'nock';
import MonnifySDK, { MonnifyError } from '../src';
import { getTestConfig } from './setup';

describe('Refund APIs', () => {
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

  describe('initiateRefund', () => {
    const mockRefundRequest = {
      transactionReference: 'TXN-123',
      refundAmount: 25000,
      refundReference: 'REF-001',
      customerNote: 'Partial refund requested'
    };

    it('should initiate refund successfully', async () => {
      const mockResponse = {
        requestSuccessful: true,
        responseMessage: 'success',
        responseCode: '0',
        responseBody: {
          ...mockRefundRequest,
          refundStatus: 'PROCESSING',
          refundDate: '2024-01-01T00:00:00'
        }
      };

      nock(mockConfig.baseURL)
        .post('/api/v1/refunds/initiate-refund')
        .reply(200, mockResponse);

      const result = await sdk.initiateRefund(mockRefundRequest);
      
      expect(result.requestSuccessful).toBe(true);
      expect(result.responseBody.refundReference).toBe('REF-001');
      expect(result.responseBody.refundStatus).toBe('PROCESSING');
    });
  });

  describe('getRefundStatus', () => {
    it('should get refund status successfully', async () => {
      const mockResponse = {
        requestSuccessful: true,
        responseMessage: 'success',
        responseCode: '0',
        responseBody: {
          refundReference: 'REF-001',
          refundStatus: 'COMPLETED',
          refundAmount: 25000,
          refundDate: '2024-01-01T00:00:00'
        }
      };

      nock(mockConfig.baseURL)
        .get('/api/v1/refunds/REF-001')
        .reply(200, mockResponse);

      const result = await sdk.getRefundStatus('REF-001');
      
      expect(result.requestSuccessful).toBe(true);
      expect(result.responseBody.refundStatus).toBe('COMPLETED');
    });

    it('should throw error for empty refund reference', async () => {
      await expect(sdk.getRefundStatus('')).rejects.toThrow(MonnifyError);
    });
  });
});