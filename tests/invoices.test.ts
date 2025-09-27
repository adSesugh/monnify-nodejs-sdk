import nock from 'nock';
import MonnifySDK, { MonnifyError } from '../src';
import { getTestConfig } from './setup';

describe('Invoice APIs', () => {
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

  describe('createInvoice', () => {
    const mockInvoiceRequest = {
      amount: 50000,
      invoiceReference: 'INV-001',
      description: 'Service payment',
      customerName: 'John Doe',
      customerEmail: 'john@example.com',
      expiryDate: '2024-12-31'
    };

    it('should create invoice successfully', async () => {
      const mockResponse = {
        requestSuccessful: true,
        responseMessage: 'success',
        responseCode: '0',
        responseBody: {
          ...mockInvoiceRequest,
          status: 'PENDING',
          dateCreated: '2024-01-01T00:00:00',
          invoiceUrl: 'https://checkout.monnify.com/invoice/INV-001'
        }
      };

      nock(mockConfig.baseURL)
        .post('/api/v1/invoice/create')
        .reply(200, mockResponse);

      const result = await sdk.createInvoice(mockInvoiceRequest);
      
      expect(result.requestSuccessful).toBe(true);
      expect(result.responseBody.invoiceReference).toBe('INV-001');
      expect(result.responseBody.status).toBe('PENDING');
      expect(result.responseBody.invoiceUrl).toBeDefined();
    });
  });

  describe('getInvoice', () => {
    it('should get invoice details successfully', async () => {
      const mockResponse = {
        requestSuccessful: true,
        responseMessage: 'success',
        responseCode: '0',
        responseBody: {
          invoiceReference: 'INV-001',
          amount: 50000,
          status: 'PAID',
          customerName: 'John Doe'
        }
      };

      nock(mockConfig.baseURL)
        .get('/api/v1/invoice/INV-001')
        .reply(200, mockResponse);

      const result = await sdk.getInvoice('INV-001');
      
      expect(result.requestSuccessful).toBe(true);
      expect(result.responseBody.status).toBe('PAID');
    });

    it('should throw error for empty invoice reference', async () => {
      await expect(sdk.getInvoice('')).rejects.toThrow(MonnifyError);
    });
  });

  describe('getAllInvoices', () => {
    it('should get all invoices successfully', async () => {
      const mockResponse = {
        requestSuccessful: true,
        responseMessage: 'success',
        responseCode: '0',
        responseBody: {
          content: [
            { invoiceReference: 'INV-001', status: 'PAID' },
            { invoiceReference: 'INV-002', status: 'PENDING' }
          ]
        }
      };

      nock(mockConfig.baseURL)
        .get('/api/v1/invoice/all?page=0&size=10')
        .reply(200, mockResponse);

      const result = await sdk.getAllInvoices();
      
      expect(result.requestSuccessful).toBe(true);
      expect(result.responseBody.content).toHaveLength(2);
    });
  });

  describe('cancelInvoice', () => {
    it('should cancel invoice successfully', async () => {
      nock(mockConfig.baseURL)
        .delete('/api/v1/invoice/INV-001')
        .reply(200, {
          requestSuccessful: true,
          responseMessage: 'success',
          responseCode: '0',
          responseBody: null
        });

      const result = await sdk.cancelInvoice('INV-001');
      expect(result.requestSuccessful).toBe(true);
    });

    it('should throw error for empty invoice reference', async () => {
      await expect(sdk.cancelInvoice('')).rejects.toThrow(MonnifyError);
    });
  });
});