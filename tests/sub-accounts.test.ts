import nock from 'nock';
import MonnifySDK, { MonnifyError } from '../src';
import { getTestConfig } from './setup';

describe('Sub-Account APIs', () => {
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

  describe('createSubAccount', () => {
    const mockSubAccountRequest = {
      subAccountCode: 'SUB001',
      businessName: 'Test Business',
      businessEmail: 'test@business.com',
      businessMobile: '08012345678',
      businessAddress: '123 Test Street',
      percentageCommission: 2.5
    };

    it('should create sub-account successfully', async () => {
      const mockResponse = {
        requestSuccessful: true,
        responseMessage: 'success',
        responseCode: '0',
        responseBody: {
          ...mockSubAccountRequest,
          status: 'ACTIVE',
          dateCreated: '2024-01-01T00:00:00'
        }
      };

      nock(mockConfig.baseURL)
        .post('/api/v1/sub-accounts')
        .reply(200, mockResponse);

      const result = await sdk.createSubAccount(mockSubAccountRequest);
      
      expect(result.requestSuccessful).toBe(true);
      expect(result.responseBody.subAccountCode).toBe('SUB001');
      expect(result.responseBody.status).toBe('ACTIVE');
    });
  });

  describe('getSubAccounts', () => {
    it('should get all sub-accounts successfully', async () => {
      const mockResponse = {
        requestSuccessful: true,
        responseMessage: 'success',
        responseCode: '0',
        responseBody: {
          content: [
            { subAccountCode: 'SUB001', businessName: 'Business 1' },
            { subAccountCode: 'SUB002', businessName: 'Business 2' }
          ]
        }
      };

      nock(mockConfig.baseURL)
        .get('/api/v1/sub-accounts?page=0&size=10')
        .reply(200, mockResponse);

      const result = await sdk.getSubAccounts();
      
      expect(result.requestSuccessful).toBe(true);
      expect(result.responseBody.content).toHaveLength(2);
    });
  });

  describe('updateSubAccount', () => {
    it('should update sub-account successfully', async () => {
      const mockResponse = {
        requestSuccessful: true,
        responseMessage: 'success',
        responseCode: '0',
        responseBody: {
          subAccountCode: 'SUB001',
          businessName: 'Updated Business'
        }
      };

      nock(mockConfig.baseURL)
        .put('/api/v1/sub-accounts/SUB001')
        .reply(200, mockResponse);

      const result = await sdk.updateSubAccount('SUB001', { businessName: 'Updated Business' });
      
      expect(result.requestSuccessful).toBe(true);
      expect(result.responseBody.businessName).toBe('Updated Business');
    });

    it('should throw error for empty sub-account code', async () => {
      await expect(sdk.updateSubAccount('', {})).rejects.toThrow(MonnifyError);
    });
  });

  describe('deleteSubAccount', () => {
    it('should delete sub-account successfully', async () => {
      nock(mockConfig.baseURL)
        .delete('/api/v1/sub-accounts/SUB001')
        .reply(200, {
          requestSuccessful: true,
          responseMessage: 'success',
          responseCode: '0',
          responseBody: null
        });

      const result = await sdk.deleteSubAccount('SUB001');
      expect(result.requestSuccessful).toBe(true);
    });

    it('should throw error for empty sub-account code', async () => {
      await expect(sdk.deleteSubAccount('')).rejects.toThrow(MonnifyError);
    });
  });
});