import nock from 'nock';
import MonnifySDK, { MonnifyError } from '../src';
import { getTestConfig } from './setup';

describe('Settlement APIs', () => {
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

  describe('getSettlements', () => {
    it('should get settlements successfully', async () => {
      const mockResponse = {
        requestSuccessful: true,
        responseMessage: 'success',
        responseCode: '0',
        responseBody: {
          content: [
            {
              settlementId: 'SET-001',
              settlementDate: '2024-01-01',
              totalAmount: 100000,
              totalTransactions: 5,
              status: 'COMPLETED'
            },
            {
              settlementId: 'SET-002',
              settlementDate: '2024-01-02',
              totalAmount: 75000,
              totalTransactions: 3,
              status: 'PENDING'
            }
          ]
        }
      };

      nock(mockConfig.baseURL)
        .get('/api/v1/settlements?page=0&size=10')
        .reply(200, mockResponse);

      const result = await sdk.getSettlements();
      
      expect(result.requestSuccessful).toBe(true);
      expect(result.responseBody.content).toHaveLength(2);
      expect(result.responseBody.content[0].status).toBe('COMPLETED');
    });
  });

  describe('getSettlement', () => {
    it('should get settlement by ID successfully', async () => {
      const mockResponse = {
        requestSuccessful: true,
        responseMessage: 'success',
        responseCode: '0',
        responseBody: {
          settlementId: 'SET-001',
          settlementDate: '2024-01-01',
          totalAmount: 100000,
          totalTransactions: 5,
          status: 'COMPLETED'
        }
      };

      nock(mockConfig.baseURL)
        .get('/api/v1/settlements/SET-001')
        .reply(200, mockResponse);

      const result = await sdk.getSettlement('SET-001');
      
      expect(result.requestSuccessful).toBe(true);
      expect(result.responseBody.settlementId).toBe('SET-001');
      expect(result.responseBody.status).toBe('COMPLETED');
    });

    it('should throw error for empty settlement ID', async () => {
      await expect(sdk.getSettlement('')).rejects.toThrow(MonnifyError);
    });
  });
});