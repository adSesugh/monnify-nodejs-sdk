import nock from 'nock';
import MonnifySDK, { MonnifyError } from '../src';
import { getTestConfig } from './setup';

describe('Utility APIs', () => {
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

  describe('getBanks', () => {
    it('should get banks list successfully', async () => {
      const mockResponse = {
        requestSuccessful: true,
        responseMessage: 'success',
        responseCode: '0',
        responseBody: [
          { name: 'Access Bank', code: '044' },
          { name: 'GTBank', code: '058' },
          { name: 'First Bank', code: '011' }
        ]
      };

      nock('https://sandbox.monnify.com')
        .get('/api/v1/banks')
        .reply(200, mockResponse);

      const result = await sdk.getBanks();
      
      expect(result.requestSuccessful).toBe(true);
      expect(result.responseBody).toHaveLength(3);
      expect(result.responseBody[0].name).toBe('Access Bank');
      expect(result.responseBody[0].code).toBe('044');
    });

    it('should handle empty banks list', async () => {
      nock('https://sandbox.monnify.com')
        .get('/api/v1/banks')
        .reply(200, {
          requestSuccessful: true,
          responseMessage: 'success',
          responseCode: '0',
          responseBody: []
        });

      const result = await sdk.getBanks();
      expect(result.responseBody).toHaveLength(0);
    });
  });

  describe('verifyBankAccount', () => {
    it('should verify bank account successfully', async () => {
      const mockResponse = {
        requestSuccessful: true,
        responseMessage: 'success',
        responseCode: '0',
        responseBody: {
          accountNumber: '1234567890',
          accountName: 'JOHN DOE',
          bankCode: '044',
          bankName: 'Access Bank'
        }
      };

      nock('https://sandbox.monnify.com')
        .get('/api/v1/disbursements/account/validate?bankCode=044&accountNumber=1234567890')
        .reply(200, mockResponse);

      const result = await sdk.verifyBankAccount('044', '1234567890');
      
      expect(result.requestSuccessful).toBe(true);
      expect(result.responseBody.accountName).toBe('JOHN DOE');
      expect(result.responseBody.bankCode).toBe('044');
    });

    it('should throw error for missing bank code', async () => {
      await expect(sdk.verifyBankAccount('', '1234567890')).rejects.toThrow(MonnifyError);
    });

    it('should throw error for missing account number', async () => {
      await expect(sdk.verifyBankAccount('044', '')).rejects.toThrow(MonnifyError);
    });

    it('should handle invalid account number', async () => {
      nock('https://sandbox.monnify.com')
        .get('/api/v1/disbursements/account/validate?bankCode=044&accountNumber=0000000000')
        .reply(200, {
          requestSuccessful: false,
          responseMessage: 'Invalid account number',
          responseCode: '99'
        });

      await expect(sdk.verifyBankAccount('044', '0000000000')).rejects.toThrow(MonnifyError);
    });
  });

  describe('getWalletBalance', () => {
    it('should get default wallet balance successfully', async () => {
      const mockResponse = {
        requestSuccessful: true,
        responseMessage: 'success',
        responseCode: '0',
        responseBody: {
          availableBalance: 100000,
          ledgerBalance: 100000
        }
      };

      nock('https://sandbox.monnify.com')
        .get('/api/v2/wallets/balance')
        .reply(200, mockResponse);

      const result = await sdk.getWalletBalance();
      
      expect(result.requestSuccessful).toBe(true);
      expect(result.responseBody.availableBalance).toBe(100000);
      expect(result.responseBody.ledgerBalance).toBe(100000);
    });

    it('should get specific wallet balance successfully', async () => {
      const mockResponse = {
        requestSuccessful: true,
        responseMessage: 'success',
        responseCode: '0',
        responseBody: {
          availableBalance: 50000,
          ledgerBalance: 50000
        }
      };

      nock('https://sandbox.monnify.com')
        .get('/api/v2/wallets/WALLET-123/balance')
        .reply(200, mockResponse);

      const result = await sdk.getWalletBalance('WALLET-123');
      
      expect(result.requestSuccessful).toBe(true);
      expect(result.responseBody.availableBalance).toBe(50000);
    });

    it('should handle zero balance', async () => {
      nock('https://sandbox.monnify.com')
        .get('/api/v2/wallets/balance')
        .reply(200, {
          requestSuccessful: true,
          responseMessage: 'success',
          responseCode: '0',
          responseBody: {
            availableBalance: 0,
            ledgerBalance: 0
          }
        });

      const result = await sdk.getWalletBalance();
      expect(result.responseBody.availableBalance).toBe(0);
    });
  });
});