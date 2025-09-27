import nock from 'nock';
import MonnifySDK, { MonnifyError } from '../src';
import { getTestConfig } from './setup';

describe('Additional APIs', () => {
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

  describe('Direct Debit APIs', () => {
    it('should initiate direct debit successfully', async () => {
      const mockRequest = {
        accountNumber: '1234567890',
        bankCode: '044',
        amount: 50000,
        narration: 'Direct debit payment',
        reference: 'DD-001'
      };

      const mockResponse = {
        requestSuccessful: true,
        responseMessage: 'success',
        responseCode: '0',
        responseBody: {
          transactionReference: 'TXN-DD-001',
          paymentStatus: 'PAID',
          amountPaid: 50000
        }
      };

      nock(mockConfig.baseURL)
        .post('/api/v1/sdk/transactions/debit-account')
        .reply(200, mockResponse);

      const result = await sdk.initiateDirectDebit(mockRequest);
      
      expect(result.requestSuccessful).toBe(true);
      expect(result.responseBody.paymentStatus).toBe('PAID');
    });
  });

  describe('USSD Payment APIs', () => {
    it('should generate USSD payment code successfully', async () => {
      const mockRequest = {
        amount: 25000,
        customerName: 'John Doe',
        customerEmail: 'john@example.com',
        paymentReference: 'USSD-001',
        paymentDescription: 'USSD payment',
        bankCode: '044'
      };

      const mockResponse = {
        requestSuccessful: true,
        responseMessage: 'success',
        responseCode: '0',
        responseBody: {
          ussdCode: '*737*000*1234#'
        }
      };

      nock(mockConfig.baseURL)
        .post('/api/v1/sdk/transactions/ussd/generate')
        .reply(200, mockResponse);

      const result = await sdk.generateUSSDPayment(mockRequest);
      
      expect(result.requestSuccessful).toBe(true);
      expect(result.responseBody.ussdCode).toBe('*737*000*1234#');
    });
  });

  describe('Virtual Account APIs', () => {
    it('should create virtual account successfully', async () => {
      const mockRequest = {
        accountName: 'John Doe Virtual',
        currencyCode: 'NGN',
        accountReference: 'VA-001',
        customerName: 'John Doe',
        customerEmail: 'john@example.com',
        bvn: '12345678901'
      };

      const mockResponse = {
        requestSuccessful: true,
        responseMessage: 'success',
        responseCode: '0',
        responseBody: {
          accountReference: 'VA-001',
          accountName: 'John Doe Virtual',
          accounts: [
            { accountNumber: '9876543210', bankCode: '044', bankName: 'Access Bank' }
          ]
        }
      };

      nock(mockConfig.baseURL)
        .post('/api/v1/bank-transfer/virtual-accounts')
        .reply(200, mockResponse);

      const result = await sdk.createVirtualAccount(mockRequest);
      
      expect(result.requestSuccessful).toBe(true);
      expect(result.responseBody.accountReference).toBe('VA-001');
    });
  });

  describe('Merchant Profile APIs', () => {
    it('should get merchant profile successfully', async () => {
      const mockResponse = {
        requestSuccessful: true,
        responseMessage: 'success',
        responseCode: '0',
        responseBody: {
          merchantCode: 'MERCHANT001',
          merchantName: 'Test Merchant',
          merchantEmail: 'merchant@test.com',
          merchantMobile: '08012345678',
          businessType: 'E-COMMERCE',
          status: 'ACTIVE',
          dateCreated: '2024-01-01T00:00:00'
        }
      };

      nock(mockConfig.baseURL)
        .get('/api/v1/merchant/profile')
        .reply(200, mockResponse);

      const result = await sdk.getMerchantProfile();
      
      expect(result.requestSuccessful).toBe(true);
      expect(result.responseBody.merchantCode).toBe('MERCHANT001');
      expect(result.responseBody.status).toBe('ACTIVE');
    });

    it('should update merchant profile successfully', async () => {
      const mockResponse = {
        requestSuccessful: true,
        responseMessage: 'success',
        responseCode: '0',
        responseBody: {
          merchantName: 'Updated Merchant Name'
        }
      };

      nock(mockConfig.baseURL)
        .put('/api/v1/merchant/profile')
        .reply(200, mockResponse);

      const result = await sdk.updateMerchantProfile({ merchantName: 'Updated Merchant Name' });
      
      expect(result.requestSuccessful).toBe(true);
      expect(result.responseBody.merchantName).toBe('Updated Merchant Name');
    });
  });

  describe('Transaction Statistics APIs', () => {
    it('should get transaction statistics successfully', async () => {
      const mockResponse = {
        requestSuccessful: true,
        responseMessage: 'success',
        responseCode: '0',
        responseBody: {
          totalTransactions: 100,
          totalAmount: 5000000,
          successfulTransactions: 95,
          failedTransactions: 5,
          pendingTransactions: 0,
          period: '2024-01'
        }
      };

      nock(mockConfig.baseURL)
        .get('/api/v1/transactions/stats?startDate=2024-01-01&endDate=2024-01-31')
        .reply(200, mockResponse);

      const result = await sdk.getTransactionStatistics('2024-01-01', '2024-01-31');
      
      expect(result.requestSuccessful).toBe(true);
      expect(result.responseBody.totalTransactions).toBe(100);
      expect(result.responseBody.successfulTransactions).toBe(95);
    });
  });

  describe('BVN Verification APIs', () => {
    it('should verify BVN successfully', async () => {
      const mockRequest = {
        bvn: '12345678901',
        name: 'John Doe',
        dateOfBirth: '1990-01-01',
        mobileNumber: '08012345678'
      };

      const mockResponse = {
        requestSuccessful: true,
        responseMessage: 'success',
        responseCode: '0',
        responseBody: {
          bvn: '12345678901',
          firstName: 'John',
          lastName: 'Doe',
          dateOfBirth: '1990-01-01',
          mobileNumber: '08012345678',
          verificationStatus: 'VERIFIED'
        }
      };

      nock(mockConfig.baseURL)
        .post('/api/v1/vas/bvn-details-match')
        .reply(200, mockResponse);

      const result = await sdk.verifyBVN(mockRequest);
      
      expect(result.requestSuccessful).toBe(true);
      expect(result.responseBody.verificationStatus).toBe('VERIFIED');
    });
  });

  describe('Payment Link APIs', () => {
    it('should create payment link successfully', async () => {
      const mockRequest = {
        amount: 75000,
        description: 'Product payment',
        redirectUrl: 'https://example.com/callback',
        customerName: 'Jane Doe',
        customerEmail: 'jane@example.com'
      };

      const mockResponse = {
        requestSuccessful: true,
        responseMessage: 'success',
        responseCode: '0',
        responseBody: {
          paymentReference: 'LINK-001',
          checkoutUrl: 'https://checkout.monnify.com/link/LINK-001',
          amount: 75000,
          description: 'Product payment',
          status: 'ACTIVE',
          dateCreated: '2024-01-01T00:00:00'
        }
      };

      nock(mockConfig.baseURL)
        .post('/api/v1/merchant/payment-links')
        .reply(200, mockResponse);

      const result = await sdk.createPaymentLink(mockRequest);
      
      expect(result.requestSuccessful).toBe(true);
      expect(result.responseBody.paymentReference).toBe('LINK-001');
      expect(result.responseBody.checkoutUrl).toBeDefined();
    });

    it('should get payment link successfully', async () => {
      const mockResponse = {
        requestSuccessful: true,
        responseMessage: 'success',
        responseCode: '0',
        responseBody: {
          paymentReference: 'LINK-001',
          status: 'PAID',
          amount: 75000
        }
      };

      nock(mockConfig.baseURL)
        .get('/api/v1/merchant/payment-links/LINK-001')
        .reply(200, mockResponse);

      const result = await sdk.getPaymentLink('LINK-001');
      
      expect(result.requestSuccessful).toBe(true);
      expect(result.responseBody.status).toBe('PAID');
    });

    it('should throw error for empty payment reference', async () => {
      await expect(sdk.getPaymentLink('')).rejects.toThrow(MonnifyError);
    });
  });

  describe('Additional Utility APIs', () => {
    it('should get transactions by customer email successfully', async () => {
      const mockResponse = {
        requestSuccessful: true,
        responseMessage: 'success',
        responseCode: '0',
        responseBody: {
          content: [
            { transactionReference: 'TXN-1', customerEmail: 'john@example.com' },
            { transactionReference: 'TXN-2', customerEmail: 'john@example.com' }
          ]
        }
      };

      nock(mockConfig.baseURL)
        .get('/api/v1/transactions/search-by-email?email=john%40example.com&page=0&size=10')
        .reply(200, mockResponse);

      const result = await sdk.getTransactionsByCustomerEmail('john@example.com');
      
      expect(result.requestSuccessful).toBe(true);
      expect(result.responseBody.content).toHaveLength(2);
    });

    it('should throw error for empty customer email', async () => {
      await expect(sdk.getTransactionsByCustomerEmail('')).rejects.toThrow(MonnifyError);
    });

    it('should get transactions by date range successfully', async () => {
      const mockResponse = {
        requestSuccessful: true,
        responseMessage: 'success',
        responseCode: '0',
        responseBody: {
          content: [
            { transactionReference: 'TXN-1', paidOn: '2024-01-01' },
            { transactionReference: 'TXN-2', paidOn: '2024-01-02' }
          ]
        }
      };

      nock(mockConfig.baseURL)
        .get('/api/v1/transactions/search-by-date?startDate=2024-01-01&endDate=2024-01-31&page=0&size=10')
        .reply(200, mockResponse);

      const result = await sdk.getTransactionsByDateRange('2024-01-01', '2024-01-31');
      
      expect(result.requestSuccessful).toBe(true);
      expect(result.responseBody.content).toHaveLength(2);
    });

    it('should resend webhook successfully', async () => {
      nock(mockConfig.baseURL)
        .post('/api/v1/transactions/TXN-123/resend-webhook')
        .reply(200, {
          requestSuccessful: true,
          responseMessage: 'success',
          responseCode: '0',
          responseBody: null
        });

      const result = await sdk.resendWebhook('TXN-123');
      expect(result.requestSuccessful).toBe(true);
    });

    it('should throw error for empty transaction reference in resend webhook', async () => {
      await expect(sdk.resendWebhook('')).rejects.toThrow(MonnifyError);
    });
  });
});