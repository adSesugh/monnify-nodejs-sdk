import nock from 'nock';
import MonnifySDK, { MonnifyError } from '../src';
import { getTestConfig } from './setup';

describe('Reserved Account APIs', () => {
  let sdk: MonnifySDK;
  const mockConfig = getTestConfig();

  beforeEach(() => {
    sdk = new MonnifySDK(mockConfig);
    
    // Mock authentication
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

  afterEach(() => {
    nock.cleanAll();
  });

  describe('createReservedAccount', () => {
    const mockAccountRequest = {
      accountReference: 'ACC-123',
      accountName: 'John Doe Account',
      currencyCode: 'NGN',
      customerEmail: 'john@example.com',
      customerName: 'John Doe'
    };

    it('should create reserved account successfully', async () => {
      const mockResponse = {
        requestSuccessful: true,
        responseMessage: 'success',
        responseCode: '0',
        responseBody: {
          accountReference: 'ACC-123',
          accountName: 'John Doe Account',
          accounts: [
            { accountNumber: '1234567890', bankCode: '044', bankName: 'Access Bank' }
          ]
        }
      };

      nock('https://sandbox.monnify.com')
        .post('/api/v2/bank-transfer/reserved-accounts')
        .reply(200, mockResponse);

      const result = await sdk.createReservedAccount(mockAccountRequest);
      
      expect(result.requestSuccessful).toBe(true);
      expect(result.responseBody.accountReference).toBe('ACC-123');
      expect(result.responseBody.accounts).toHaveLength(1);
    });

    it('should add contract code from config', async () => {
      nock('https://sandbox.monnify.com')
        .post('/api/v2/bank-transfer/reserved-accounts', (body) => {
          expect(body.contractCode).toBe(mockConfig.contractCode);
          return true;
        })
        .reply(200, {
          requestSuccessful: true,
          responseMessage: 'success',
          responseCode: '0',
          responseBody: {}
        });

      await sdk.createReservedAccount(mockAccountRequest);
    });
  });

  describe('getReservedAccountDetails', () => {
    it('should get account details successfully', async () => {
      const mockResponse = {
        requestSuccessful: true,
        responseMessage: 'success',
        responseCode: '0',
        responseBody: {
          accountReference: 'ACC-123',
          accountName: 'John Doe Account',
          status: 'ACTIVE'
        }
      };

      nock('https://sandbox.monnify.com')
        .get('/api/v2/bank-transfer/reserved-accounts/ACC-123')
        .reply(200, mockResponse);

      const result = await sdk.getReservedAccountDetails('ACC-123');
      
      expect(result.requestSuccessful).toBe(true);
      expect(result.responseBody.accountReference).toBe('ACC-123');
    });

    it('should throw error for empty account reference', async () => {
      await expect(sdk.getReservedAccountDetails('')).rejects.toThrow(MonnifyError);
    });

    it('should handle URL encoding for account reference', async () => {
      nock('https://sandbox.monnify.com')
        .get('/api/v2/bank-transfer/reserved-accounts/ACC%2F123')
        .reply(200, {
          requestSuccessful: true,
          responseMessage: 'success',
          responseCode: '0',
          responseBody: {}
        });

      await sdk.getReservedAccountDetails('ACC/123');
    });
  });

  describe('updateReservedAccount', () => {
    it('should update account successfully', async () => {
      const mockResponse = {
        requestSuccessful: true,
        responseMessage: 'success',
        responseCode: '0',
        responseBody: {
          accountReference: 'ACC-123',
          customerName: 'Jane Doe',
          customerEmail: 'jane@example.com'
        }
      };

      nock('https://sandbox.monnify.com')
        .put('/api/v1/bank-transfer/reserved-accounts/reference/ACC-123')
        .reply(200, mockResponse);

      const result = await sdk.updateReservedAccount('ACC-123', 'Jane Doe', 'jane@example.com');
      
      expect(result.requestSuccessful).toBe(true);
      expect(result.responseBody.customerName).toBe('Jane Doe');
    });

    it('should throw error for missing parameters', async () => {
      await expect(sdk.updateReservedAccount('', 'Jane', 'jane@example.com')).rejects.toThrow(MonnifyError);
      await expect(sdk.updateReservedAccount('ACC-123', '', 'jane@example.com')).rejects.toThrow(MonnifyError);
      await expect(sdk.updateReservedAccount('ACC-123', 'Jane', '')).rejects.toThrow(MonnifyError);
    });
  });

  describe('deleteReservedAccount', () => {
    it('should delete account successfully', async () => {
      nock('https://sandbox.monnify.com')
        .delete('/api/v1/bank-transfer/reserved-accounts/reference/ACC-123')
        .reply(200, {
          requestSuccessful: true,
          responseMessage: 'success',
          responseCode: '0',
          responseBody: null
        });

      const result = await sdk.deleteReservedAccount('ACC-123');
      expect(result.requestSuccessful).toBe(true);
    });

    it('should throw error for empty account reference', async () => {
      await expect(sdk.deleteReservedAccount('')).rejects.toThrow(MonnifyError);
    });
  });

  describe('getReservedAccountTransactions', () => {
    it('should get account transactions successfully', async () => {
      const mockResponse = {
        requestSuccessful: true,
        responseMessage: 'success',
        responseCode: '0',
        responseBody: {
          content: [
            { transactionReference: 'TXN-1', amount: 5000 },
            { transactionReference: 'TXN-2', amount: 10000 }
          ]
        }
      };

      nock('https://sandbox.monnify.com')
        .get('/api/v1/bank-transfer/reserved-accounts/ACC-123/transactions?page=0&size=10')
        .reply(200, mockResponse);

      const result = await sdk.getReservedAccountTransactions('ACC-123');
      
      expect(result.requestSuccessful).toBe(true);
      expect(result.responseBody.content).toHaveLength(2);
    });

    it('should throw error for empty account reference', async () => {
      await expect(sdk.getReservedAccountTransactions('')).rejects.toThrow(MonnifyError);
    });

    it('should handle custom pagination', async () => {
      nock('https://sandbox.monnify.com')
        .get('/api/v1/bank-transfer/reserved-accounts/ACC-123/transactions?page=1&size=20')
        .reply(200, {
          requestSuccessful: true,
          responseMessage: 'success',
          responseCode: '0',
          responseBody: { content: [] }
        });

      await sdk.getReservedAccountTransactions('ACC-123', 1, 20);
    });
  });
});