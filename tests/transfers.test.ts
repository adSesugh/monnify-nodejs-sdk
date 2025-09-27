import nock from 'nock';
import MonnifySDK, { MonnifyError } from '../src';
import { getTestConfig } from './setup';

describe('Transfer APIs', () => {
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

  describe('initiateSingleTransfer', () => {
    const mockTransferRequest = {
      amount: 50000,
      reference: 'TRF-123',
      narration: 'Test transfer',
      destinationBankCode: '044',
      destinationAccountNumber: '1234567890'
    };

    it('should initiate single transfer successfully', async () => {
      const mockResponse = {
        requestSuccessful: true,
        responseMessage: 'success',
        responseCode: '0',
        responseBody: {
          reference: 'TRF-123',
          status: 'SUCCESS',
          amount: 50000
        }
      };

      nock('https://sandbox.monnify.com')
        .post('/api/v2/disbursements/single')
        .reply(200, mockResponse);

      const result = await sdk.initiateSingleTransfer(mockTransferRequest);
      
      expect(result.requestSuccessful).toBe(true);
      expect(result.responseBody.reference).toBe('TRF-123');
      expect(result.responseBody.status).toBe('SUCCESS');
    });

    it('should add default currency and source account', async () => {
      nock('https://sandbox.monnify.com')
        .post('/api/v2/disbursements/single', (body) => {
          expect(body.currency).toBe('NGN');
          expect(body.sourceAccountNumber).toBe(mockConfig.contractCode);
          return true;
        })
        .reply(200, {
          requestSuccessful: true,
          responseMessage: 'success',
          responseCode: '0',
          responseBody: {}
        });

      await sdk.initiateSingleTransfer(mockTransferRequest);
    });
  });

  describe('initiateBulkTransfer', () => {
    const mockBulkTransferRequest = {
      title: 'Bulk Transfer Test',
      batchReference: 'BATCH-123',
      narration: 'Test bulk transfer',
      sourceAccountNumber: mockConfig.contractCode,
      onValidationFailure: 'BREAK' as const,
      notificationInterval: 10,
      transactionList: [
        {
          amount: 25000,
          reference: 'TRF-1',
          narration: 'Transfer 1',
          destinationBankCode: '044',
          destinationAccountNumber: '1111111111'
        },
        {
          amount: 35000,
          reference: 'TRF-2',
          narration: 'Transfer 2',
          destinationBankCode: '058',
          destinationAccountNumber: '2222222222'
        }
      ]
    };

    it('should initiate bulk transfer successfully', async () => {
      const mockResponse = {
        requestSuccessful: true,
        responseMessage: 'success',
        responseCode: '0',
        responseBody: {
          batchReference: 'BATCH-123',
          batchStatus: 'PROCESSING',
          totalAmount: 60000,
          totalTransactions: 2
        }
      };

      nock('https://sandbox.monnify.com')
        .post('/api/v2/disbursements/batch')
        .reply(200, mockResponse);

      const result = await sdk.initiateBulkTransfer(mockBulkTransferRequest);
      
      expect(result.requestSuccessful).toBe(true);
      expect(result.responseBody.batchReference).toBe('BATCH-123');
      expect(result.responseBody.totalTransactions).toBe(2);
    });
  });

  describe('getTransferStatus', () => {
    it('should get transfer status successfully', async () => {
      const mockResponse = {
        requestSuccessful: true,
        responseMessage: 'success',
        responseCode: '0',
        responseBody: {
          reference: 'TRF-123',
          status: 'SUCCESS',
          amount: 50000,
          dateCreated: '2024-01-01T00:00:00'
        }
      };

      nock('https://sandbox.monnify.com')
        .get('/api/v2/disbursements/single/summary?reference=TRF-123')
        .reply(200, mockResponse);

      const result = await sdk.getTransferStatus('TRF-123');
      
      expect(result.requestSuccessful).toBe(true);
      expect(result.responseBody.status).toBe('SUCCESS');
    });

    it('should throw error for empty reference', async () => {
      await expect(sdk.getTransferStatus('')).rejects.toThrow(MonnifyError);
    });

    it('should handle URL encoding for reference', async () => {
      nock('https://sandbox.monnify.com')
        .get('/api/v2/disbursements/single/summary?reference=TRF%2F123')
        .reply(200, {
          requestSuccessful: true,
          responseMessage: 'success',
          responseCode: '0',
          responseBody: {}
        });

      await sdk.getTransferStatus('TRF/123');
    });
  });

  describe('getBulkTransferStatus', () => {
    it('should get bulk transfer status successfully', async () => {
      const mockResponse = {
        requestSuccessful: true,
        responseMessage: 'success',
        responseCode: '0',
        responseBody: {
          batchReference: 'BATCH-123',
          batchStatus: 'COMPLETED',
          totalAmount: 60000,
          successfulTransactions: 2,
          failedTransactions: 0
        }
      };

      nock('https://sandbox.monnify.com')
        .get('/api/v2/disbursements/batch/summary?batchReference=BATCH-123')
        .reply(200, mockResponse);

      const result = await sdk.getBulkTransferStatus('BATCH-123');
      
      expect(result.requestSuccessful).toBe(true);
      expect(result.responseBody.batchStatus).toBe('COMPLETED');
      expect(result.responseBody.successfulTransactions).toBe(2);
    });

    it('should throw error for empty batch reference', async () => {
      await expect(sdk.getBulkTransferStatus('')).rejects.toThrow(MonnifyError);
    });

    it('should handle URL encoding for batch reference', async () => {
      nock('https://sandbox.monnify.com')
        .get('/api/v2/disbursements/batch/summary?batchReference=BATCH%2F123')
        .reply(200, {
          requestSuccessful: true,
          responseMessage: 'success',
          responseCode: '0',
          responseBody: {}
        });

      await sdk.getBulkTransferStatus('BATCH/123');
    });
  });
});