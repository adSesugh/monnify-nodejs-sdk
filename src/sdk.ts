// Import required dependencies
import axios, { AxiosInstance, AxiosError } from 'axios';
import { createHash } from 'crypto';
import * as types from './types';

// Custom error class for Monnify-specific errors
export class MonnifyError extends Error {
  public code: string;
  public statusCode?: number;
  
  constructor(message: string, code: string, statusCode?: number) {
    super(message);
    this.name = 'MonnifyError';
    this.code = code;
    this.statusCode = statusCode;
  }
}

// Main SDK class for Monnify API integration
export class MonnifySDK {
  private client: AxiosInstance; // HTTP client for API requests
  private config: types.MonnifyConfig; // SDK configuration
  private accessToken: string | null = null; // Cached access token
  private tokenExpiry: number = 0; // Token expiry timestamp
  private readonly retryAttempts = 3; // Max retry attempts
  private readonly retryDelay = 1000; // Retry delay in ms

  constructor(config: types.MonnifyConfig) {
    // Validate required configuration
    if (!config.contractCode || !config.secretKey || !config.apiKey) {
      throw new MonnifyError('Missing required configuration', 'INVALID_CONFIG');
    }

    // Set configuration with defaults
    this.config = {
      ...config,
      baseURL: config.baseURL || 'https://api.monnify.com'
    };

    // Create HTTP client with default settings
    this.client = axios.create({
      baseURL: this.config.baseURL,
      timeout: 30000, // 30 second timeout
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'monnify-nodejs-sdk/1.0.0'
      }
    });

    // Setup response interceptors for error handling
    this.setupInterceptors();
  }

  // Setup response interceptors for consistent error handling
  private setupInterceptors(): void {
    this.client.interceptors.response.use(
      (response) => response, // Pass through successful responses
      (error: AxiosError) => {
        // Handle API errors with proper error codes
        if (error.response) {
          const { status, data } = error.response;
          const message = (data as any)?.responseMessage || error.message;
          throw new MonnifyError(message, 'API_ERROR', status);
        }
        // Handle network/connection errors
        throw new MonnifyError(error.message, 'NETWORK_ERROR');
      }
    );
  }

  // Authenticate with Monnify API and cache access token
  private async authenticate(): Promise<void> {
    // Skip if token is still valid
    if (this.accessToken && Date.now() < this.tokenExpiry) {
      return;
    }

    try {
      // Create Basic Auth credentials
      const credentials = Buffer.from(`${this.config.apiKey}:${this.config.secretKey}`).toString('base64');
      
      // Request access token
      const response = await this.client.post<types.AuthResponse>('/api/v1/auth/login', {}, {
        headers: {
          'Authorization': `Basic ${credentials}`
        }
      });

      if (response.data.requestSuccessful) {
        // Cache token with 1 minute buffer before expiry
        this.accessToken = response.data.responseBody.accessToken;
        this.tokenExpiry = Date.now() + (response.data.responseBody.expiresIn * 1000) - 60000;
      } else {
        throw new MonnifyError(`Authentication failed: ${response.data.responseMessage}`, 'AUTH_FAILED');
      }
    } catch (error) {
      if (error instanceof MonnifyError) throw error;
      throw new MonnifyError('Authentication request failed', 'AUTH_REQUEST_FAILED');
    }
  }

  // Generic method to make authenticated API requests
  private async makeRequest<T>(method: string, endpoint: string, data?: any): Promise<types.MonnifyResponse<T>> {
    // Ensure we have a valid access token
    await this.authenticate();
    
    try {
      // Make the API request with Bearer token
      const response = await this.client.request<types.MonnifyResponse<T>>({
        method,
        url: endpoint,
        data,
        headers: {
          'Authorization': `Bearer ${this.accessToken}`
        }
      });

      // Check if API returned success status
      if (!response.data.requestSuccessful) {
        throw new MonnifyError(response.data.responseMessage, response.data.responseCode);
      }

      return response.data;
    } catch (error) {
      if (error instanceof MonnifyError) throw error;
      throw new MonnifyError('Request failed', 'REQUEST_FAILED');
    }
  }

  // === TRANSACTION APIs ===
  
  // Initialize a new payment transaction
  async initializeTransaction(request: types.TransactionRequest): Promise<types.MonnifyResponse<types.Transaction>> {
    // Add default values for optional fields
    const payload = {
      ...request,
      contractCode: request.contractCode || this.config.contractCode,
      currencyCode: request.currencyCode || 'NGN'
    };

    return this.makeRequest('POST', '/api/v1/merchant/transactions/init-transaction', payload);
  }

  // Get the status of a specific transaction
  async getTransactionStatus(transactionReference: string): Promise<types.MonnifyResponse<types.Transaction>> {
    if (!transactionReference) {
      throw new MonnifyError('Transaction reference is required', 'INVALID_PARAMETER');
    }
    return this.makeRequest('GET', `/api/v2/transactions/${encodeURIComponent(transactionReference)}`);
  }

  // Get paginated list of all transactions
  async getAllTransactions(page: number = 0, size: number = 10): Promise<types.MonnifyResponse<{ content: types.Transaction[] }>> {
    return this.makeRequest('GET', `/api/v1/transactions/search?page=${page}&size=${size}`);
  }

  // === RESERVED ACCOUNT APIs ===
  
  // Create a new reserved account for a customer
  async createReservedAccount(request: types.ReservedAccountRequest): Promise<types.MonnifyResponse<types.ReservedAccount>> {
    // Add contract code if not provided
    const payload = {
      ...request,
      contractCode: request.contractCode || this.config.contractCode
    };

    return this.makeRequest('POST', '/api/v2/bank-transfer/reserved-accounts', payload);
  }

  // Get details of a specific reserved account
  async getReservedAccountDetails(accountReference: string): Promise<types.MonnifyResponse<types.ReservedAccount>> {
    if (!accountReference) {
      throw new MonnifyError('Account reference is required', 'INVALID_PARAMETER');
    }
    return this.makeRequest('GET', `/api/v2/bank-transfer/reserved-accounts/${encodeURIComponent(accountReference)}`);
  }

  // Update customer details for a reserved account
  async updateReservedAccount(accountReference: string, customerName: string, customerEmail: string): Promise<types.MonnifyResponse<types.ReservedAccount>> {
    if (!accountReference || !customerName || !customerEmail) {
      throw new MonnifyError('Account reference, customer name and email are required', 'INVALID_PARAMETER');
    }
    return this.makeRequest('PUT', `/api/v1/bank-transfer/reserved-accounts/reference/${encodeURIComponent(accountReference)}`, {
      customerName,
      customerEmail
    });
  }

  // Delete a reserved account
  async deleteReservedAccount(accountReference: string): Promise<types.MonnifyResponse<void>> {
    if (!accountReference) {
      throw new MonnifyError('Account reference is required', 'INVALID_PARAMETER');
    }
    return this.makeRequest('DELETE', `/api/v1/bank-transfer/reserved-accounts/reference/${encodeURIComponent(accountReference)}`);
  }

  // Get transactions for a specific reserved account
  async getReservedAccountTransactions(accountReference: string, page: number = 0, size: number = 10): Promise<types.MonnifyResponse<{ content: types.Transaction[] }>> {
    if (!accountReference) {
      throw new MonnifyError('Account reference is required', 'INVALID_PARAMETER');
    }
    return this.makeRequest('GET', `/api/v1/bank-transfer/reserved-accounts/${encodeURIComponent(accountReference)}/transactions?page=${page}&size=${size}`);
  }

  // === TRANSFER APIs (Disbursements) ===
  
  // Initiate a single money transfer to a bank account
  async initiateSingleTransfer(request: types.TransferRequest): Promise<types.MonnifyResponse<types.TransferStatus>> {
    // Add default values for optional fields
    const payload = {
      ...request,
      currency: request.currency || 'NGN',
      sourceAccountNumber: request.sourceAccountNumber || this.config.contractCode
    };

    return this.makeRequest('POST', '/api/v2/disbursements/single', payload);
  }

  // Initiate multiple transfers in a single batch
  async initiateBulkTransfer(request: types.BulkTransferRequest): Promise<types.MonnifyResponse<types.BulkTransferStatus>> {
    return this.makeRequest('POST', '/api/v2/disbursements/batch', request);
  }

  // Get status of a single transfer
  async getTransferStatus(reference: string): Promise<types.MonnifyResponse<types.TransferStatus>> {
    if (!reference) {
      throw new MonnifyError('Transfer reference is required', 'INVALID_PARAMETER');
    }
    return this.makeRequest('GET', `/api/v2/disbursements/single/summary?reference=${encodeURIComponent(reference)}`);
  }

  // Get status of a bulk transfer batch
  async getBulkTransferStatus(batchReference: string): Promise<types.MonnifyResponse<types.BulkTransferStatus>> {
    if (!batchReference) {
      throw new MonnifyError('Batch reference is required', 'INVALID_PARAMETER');
    }
    return this.makeRequest('GET', `/api/v2/disbursements/batch/summary?batchReference=${encodeURIComponent(batchReference)}`);
  }

  // === UTILITY APIs ===
  
  // Get list of all supported banks
  async getBanks(): Promise<types.MonnifyResponse<types.Bank[]>> {
    return this.makeRequest('GET', '/api/v1/banks');
  }

  // Verify bank account details (account name lookup)
  async verifyBankAccount(bankCode: string, accountNumber: string): Promise<types.MonnifyResponse<types.AccountDetails>> {
    if (!bankCode || !accountNumber) {
      throw new MonnifyError('Bank code and account number are required', 'INVALID_PARAMETER');
    }
    return this.makeRequest('GET', `/api/v1/disbursements/account/validate?bankCode=${bankCode}&accountNumber=${accountNumber}`);
  }

  // Get wallet balance (default wallet or specific wallet)
  async getWalletBalance(walletId?: string): Promise<types.MonnifyResponse<types.WalletBalance>> {
    const endpoint = walletId ? `/api/v2/wallets/${walletId}/balance` : '/api/v2/wallets/balance';
    return this.makeRequest('GET', endpoint);
  }

  // === WEBHOOK VERIFICATION ===
  
  // Verify webhook signature to ensure request authenticity
  verifyWebhookSignature(payload: string, signature: string): boolean {
    if (!payload || !signature) {
      throw new MonnifyError('Payload and signature are required', 'INVALID_PARAMETER');
    }

    // Create SHA-512 hash of payload + secret key
    const hash = createHash('sha512')
      .update(payload + this.config.secretKey)
      .digest('hex');
    
    // Compare computed hash with provided signature
    return hash === signature;
  }
}