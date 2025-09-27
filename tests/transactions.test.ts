import nock from 'nock';
import MonnifySDK, { MonnifyError } from '../src';
import { getTestConfig } from './setup';

describe('Transaction APIs', () => {
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

  describe('initializeTransaction', () => {
    const mockTransactionRequest = {
      amount: 10000,
      customerName: 'John Doe',
      customerEmail: 'john@example.com',
      paymentReference: 'PAY-123',
      paymentDescription: 'Test payment'
    };

    it('should initialize transaction successfully', async () => {
      const mockResponse = {
        requestSuccessful: true,
        responseMessage: 'success',
        responseCode: '0',
        responseBody: {
          transactionReference: 'TXN-123',
          paymentReference: 'PAY-123',
          checkoutUrl: 'https://checkout.monnify.com/123',
          amount: 10000,
          paymentStatus: 'PENDING'
        }
      };

      nock('https://sandbox.monnify.com')
        .post('/api/v1/merchant/transactions/init-transaction')
        .reply(200, mockResponse);

      const result = await sdk.initializeTransaction(mockTransactionRequest);
      
      expect(result.requestSuccessful).toBe(true);
      expect(result.responseBody.transactionReference).toBe('TXN-123');
      expect(result.responseBody.checkoutUrl).toBeDefined();
    });

    it('should add default currency code', async () => {
      nock('https://sandbox.monnify.com')
        .post('/api/v1/merchant/transactions/init-transaction', (body) => {
          expect(body.currencyCode).toBe('NGN');
          return true;
        })
        .reply(200, {
          requestSuccessful: true,
          responseMessage: 'success',
          responseCode: '0',
          responseBody: {}
        });

      await sdk.initializeTransaction(mockTransactionRequest);
    });

    it('should add contract code from config', async () => {
      nock('https://sandbox.monnify.com')
        .post('/api/v1/merchant/transactions/init-transaction', (body) => {
          expect(body.contractCode).toBe(mockConfig.contractCode);
          return true;
        })
        .reply(200, {
          requestSuccessful: true,
          responseMessage: 'success',
          responseCode: '0',
          responseBody: {}
        });

      await sdk.initializeTransaction(mockTransactionRequest);
    });
  });

  describe('getTransactionStatus', () => {
    it('should get transaction status successfully', async () => {
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

      nock('https://sandbox.monnify.com')
        .get('/api/v2/transactions/TXN-123')
        .reply(200, mockResponse);

      const result = await sdk.getTransactionStatus('TXN-123');
      
      expect(result.requestSuccessful).toBe(true);
      expect(result.responseBody.paymentStatus).toBe('PAID');
    });

    it('should throw error for empty transaction reference', async () => {
      await expect(sdk.getTransactionStatus('')).rejects.toThrow(MonnifyError);
    });

    it('should handle URL encoding for transaction reference', async () => {
      nock('https://sandbox.monnify.com')
        .get('/api/v2/transactions/TXN%2F123')
        .reply(200, {
          requestSuccessful: true,
          responseMessage: 'success',
          responseCode: '0',
          responseBody: {}
        });

      await sdk.getTransactionStatus('TXN/123');
    });
  });

  describe('getAllTransactions', () => {
    it('should get all transactions with default pagination', async () => {
      const mockResponse = {
        requestSuccessful: true,
        responseMessage: 'success',
        responseCode: '0',
        responseBody: {
          content: [
            { transactionReference: 'TXN-1', paymentStatus: 'PAID' },
            { transactionReference: 'TXN-2', paymentStatus: 'PENDING' }
          ]
        }
      };

      nock('https://sandbox.monnify.com')
        .get('/api/v1/transactions/search?page=0&size=10')
        .reply(200, mockResponse);

      const result = await sdk.getAllTransactions();
      
      expect(result.requestSuccessful).toBe(true);
      expect(result.responseBody.content).toHaveLength(2);
    });

    it('should get all transactions with custom pagination', async () => {
      nock('https://sandbox.monnify.com')
        .get('/api/v1/transactions/search?page=1&size=20')
        .reply(200, {
          requestSuccessful: true,
          responseMessage: 'success',
          responseCode: '0',
          responseBody: { content: [] }
        });

      await sdk.getAllTransactions(1, 20);
    });
  });
});