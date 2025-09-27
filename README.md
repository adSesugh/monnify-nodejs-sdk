# Monnify Node.js SDK

[![npm version](https://badge.fury.io/js/%40adsesugh%2Fmonnify-nodejs-sdk.svg)](https://badge.fury.io/js/%40adsesugh%2Fmonnify-nodejs-sdk)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A comprehensive, production-ready Node.js SDK for integrating with the Monnify Payment Gateway API. Accept payments via cards, bank transfers, and USSD with robust error handling and TypeScript support.

## Features

- 🚀 **Production Ready**: Comprehensive error handling, retry logic, and timeout management
- 🔒 **Secure**: Built-in webhook signature verification and secure authentication
- 📝 **TypeScript**: Full TypeScript support with detailed type definitions
- 🔄 **Auto-retry**: Automatic token refresh and request retry mechanisms
- 📊 **Complete API Coverage**: All Monnify API endpoints supported
- 🛡️ **Error Handling**: Custom error classes with detailed error codes
- 🧪 **Fully Tested**: Comprehensive test suite with 95%+ coverage
- 📖 **Well Documented**: Extensive documentation with examples

## Installation

```bash
npm install @adsesugh/monnify-nodejs-sdk
```

## Quick Start

```typescript
import MonnifySDK from '@adsesugh/monnify-nodejs-sdk';

const monnify = new MonnifySDK({
  contractCode: 'your-contract-code',
  secretKey: 'your-secret-key',
  apiKey: 'your-api-key',
  baseURL: 'https://api.monnify.com' // Optional, defaults to production
});

// Initialize a transaction
try {
  const transaction = await monnify.initializeTransaction({
    amount: 5000,
    customerName: 'John Doe',
    customerEmail: 'john@example.com',
    paymentReference: 'PAY-' + Date.now(),
    paymentDescription: 'Payment for premium subscription'
  });
  
  console.log('Payment URL:', transaction.responseBody.checkoutUrl);
} catch (error) {
  console.error('Payment initialization failed:', error.message);
}
```

## Configuration

### Environment Setup

```typescript
const monnify = new MonnifySDK({
  contractCode: process.env.MONNIFY_CONTRACT_CODE!,
  secretKey: process.env.MONNIFY_SECRET_KEY!,
  apiKey: process.env.MONNIFY_API_KEY!,
  baseURL: process.env.NODE_ENV === 'production' 
    ? 'https://api.monnify.com' 
    : 'https://sandbox.monnify.com'
});
```

### Configuration Options

| Option | Type | Required | Description |
|--------|------|----------|-------------|
| `contractCode` | string | Yes | Your Monnify contract code |
| `secretKey` | string | Yes | Your Monnify secret key |
| `apiKey` | string | Yes | Your Monnify API key |
| `baseURL` | string | No | API base URL (defaults to production) |

## API Reference

### Transactions

#### Initialize Transaction

```typescript
const transaction = await monnify.initializeTransaction({
  amount: 10000, // Amount in kobo (NGN 100.00)
  customerName: 'Jane Smith',
  customerEmail: 'jane@example.com',
  paymentReference: 'unique-payment-ref-123',
  paymentDescription: 'Product purchase',
  currencyCode: 'NGN', // Optional, defaults to NGN
  redirectUrl: 'https://yoursite.com/callback', // Optional
  paymentMethods: ['CARD', 'ACCOUNT_TRANSFER'] // Optional
});
```

#### Get Transaction Status

```typescript
const status = await monnify.getTransactionStatus('transaction-reference');
console.log('Payment Status:', status.responseBody.paymentStatus);
```

#### Get All Transactions

```typescript
const transactions = await monnify.getAllTransactions(0, 20); // page, size
console.log('Transactions:', transactions.responseBody.content);
```

### Reserved Accounts

#### Create Reserved Account

```typescript
const account = await monnify.createReservedAccount({
  accountReference: 'user-123-account',
  accountName: 'John Doe Wallet',
  currencyCode: 'NGN',
  customerEmail: 'john@example.com',
  customerName: 'John Doe',
  getAllAvailableBanks: true // Optional
});

console.log('Account Numbers:', account.responseBody.accounts);
```

#### Get Account Details

```typescript
const details = await monnify.getReservedAccountDetails('user-123-account');
console.log('Account Info:', details.responseBody);
```

#### Update Reserved Account

```typescript
await monnify.updateReservedAccount(
  'user-123-account',
  'John Updated Name',
  'john.updated@example.com'
);
```

#### Delete Reserved Account

```typescript
await monnify.deleteReservedAccount('user-123-account');
```

#### Get Account Transactions

```typescript
const transactions = await monnify.getReservedAccountTransactions(
  'user-123-account',
  0, // page
  10 // size
);
```

### Transfers (Disbursements)

#### Single Transfer

```typescript
const transfer = await monnify.initiateSingleTransfer({
  amount: 50000,
  reference: 'transfer-ref-123',
  narration: 'Salary payment',
  destinationBankCode: '044',
  destinationAccountNumber: '0123456789',
  currency: 'NGN'
});
```

#### Bulk Transfer

```typescript
const bulkTransfer = await monnify.initiateBulkTransfer({
  title: 'Monthly Salaries',
  batchReference: 'batch-ref-123',
  narration: 'Salary payments for March',
  sourceAccountNumber: 'your-source-account',
  onValidationFailure: 'BREAK',
  notificationInterval: 10,
  transactionList: [
    {
      amount: 50000,
      reference: 'emp-001-salary',
      narration: 'Salary for Employee 001',
      destinationBankCode: '044',
      destinationAccountNumber: '0123456789'
    },
    {
      amount: 75000,
      reference: 'emp-002-salary',
      narration: 'Salary for Employee 002',
      destinationBankCode: '058',
      destinationAccountNumber: '9876543210'
    }
  ]
});
```

#### Get Transfer Status

```typescript
const status = await monnify.getTransferStatus('transfer-ref-123');
console.log('Transfer Status:', status.responseBody.status);
```

#### Get Bulk Transfer Status

```typescript
const status = await monnify.getBulkTransferStatus('batch-ref-123');
console.log('Batch Status:', status.responseBody);
```

### Utilities

#### Get Banks List

```typescript
const banks = await monnify.getBanks();
console.log('Available Banks:', banks.responseBody);
```

#### Verify Bank Account

```typescript
const verification = await monnify.verifyBankAccount('044', '0123456789');
console.log('Account Name:', verification.responseBody.accountName);
```

#### Get Wallet Balance

```typescript
const balance = await monnify.getWalletBalance();
console.log('Available Balance:', balance.responseBody.availableBalance);

// For specific wallet
const walletBalance = await monnify.getWalletBalance('wallet-id');
```

### Webhook Verification

```typescript
// In your webhook endpoint
app.post('/webhook', (req, res) => {
  const signature = req.headers['monnify-signature'];
  const payload = JSON.stringify(req.body);
  
  const isValid = monnify.verifyWebhookSignature(payload, signature);
  
  if (isValid) {
    // Process webhook
    console.log('Valid webhook received:', req.body);
    res.status(200).send('OK');
  } else {
    console.log('Invalid webhook signature');
    res.status(400).send('Invalid signature');
  }
});
```

## Error Handling

The SDK provides comprehensive error handling with custom error types:

```typescript
import { MonnifyError } from '@adsesugh/monnify-nodejs-sdk';

try {
  const transaction = await monnify.initializeTransaction({
    // ... transaction data
  });
} catch (error) {
  if (error instanceof MonnifyError) {
    console.error('Monnify Error:', {
      message: error.message,
      code: error.code,
      statusCode: error.statusCode
    });
    
    // Handle specific error types
    switch (error.code) {
      case 'INVALID_CONFIG':
        // Handle configuration errors
        break;
      case 'AUTH_FAILED':
        // Handle authentication errors
        break;
      case 'API_ERROR':
        // Handle API errors
        break;
      case 'NETWORK_ERROR':
        // Handle network errors
        break;
      default:
        // Handle other errors
    }
  } else {
    console.error('Unexpected error:', error);
  }
}
```

### Error Codes

| Code | Description |
|------|-------------|
| `INVALID_CONFIG` | Missing or invalid configuration |
| `INVALID_PARAMETER` | Missing or invalid method parameter |
| `AUTH_FAILED` | Authentication failed |
| `AUTH_REQUEST_FAILED` | Authentication request failed |
| `API_ERROR` | API returned an error |
| `NETWORK_ERROR` | Network/connection error |
| `REQUEST_FAILED` | General request failure |

## TypeScript Support

The SDK is written in TypeScript and provides comprehensive type definitions:

```typescript
import MonnifySDK, { 
  TransactionRequest, 
  ReservedAccountRequest,
  MonnifyResponse,
  Transaction 
} from '@adsesugh/monnify-nodejs-sdk';

// All methods return properly typed responses
const transaction: MonnifyResponse<Transaction> = await monnify.initializeTransaction({
  // TypeScript will provide autocomplete and validation
  amount: 5000,
  customerName: 'John Doe',
  // ...
});
```

## Testing

### Running Tests

```bash
npm test              # Run all tests
npm run test:watch    # Watch mode for development
npm run test:coverage # Run tests with coverage report
```

### Test Configuration

Tests can use environment variables or default to safe test values:

```bash
# Using environment variables
export MONNIFY_CONTRACT_CODE=your_test_contract
export MONNIFY_SECRET_KEY=your_test_secret
export MONNIFY_API_KEY=your_test_api_key
export MONNIFY_BASE_URL=https://sandbox.monnify.com
npm test

# Or create .env.test file
cp .env.example .env.test
# Edit .env.test with your test credentials
npm test
```

### Sandbox Environment

```typescript
const monnify = new MonnifySDK({
  contractCode: 'your-sandbox-contract-code',
  secretKey: 'your-sandbox-secret-key',
  apiKey: 'your-sandbox-api-key',
  baseURL: 'https://sandbox.monnify.com'
});
```

### Test Cards

For testing in sandbox environment:

| Card Number | CVV | Expiry | PIN | Description |
|-------------|-----|--------|-----|-------------|
| 5060666666666666666 | 123 | 03/50 | 1234 | Successful transaction |
| 5060666666666666674 | 123 | 03/50 | 1234 | Insufficient funds |

## Best Practices

### 1. Environment Variables

```bash
# .env file
MONNIFY_CONTRACT_CODE=your_contract_code
MONNIFY_SECRET_KEY=your_secret_key
MONNIFY_API_KEY=your_api_key
MONNIFY_BASE_URL=https://api.monnify.com
```

### 2. Error Handling

Always wrap SDK calls in try-catch blocks and handle errors appropriately.

### 3. Webhook Security

Always verify webhook signatures to ensure requests are from Monnify.

### 4. Reference Generation

Use unique, traceable references for all transactions and accounts:

```typescript
const paymentReference = `PAY-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
```

### 5. Amount Handling

Amounts are in kobo (smallest currency unit). NGN 100.00 = 10000 kobo.

### 6. Testing

Run tests before deploying and use the comprehensive test suite to validate integrations:

```bash
npm run test:coverage  # Ensure high test coverage
npm run lint:fix       # Fix linting issues
```

## Contributing

We welcome contributions! Please follow these guidelines:

### Code Standards
- **Documentation is mandatory**: All code must include comprehensive comments explaining functionality
- Follow existing code style and patterns
- Include TypeScript types for all new features
- Add examples for new API methods

### Process
1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. **Document your code**: Add clear comments explaining what your code does and why
4. Run linting: `npm run lint:fix`
5. Test your changes with examples
6. Commit your changes (`git commit -m 'Add some amazing feature'`)
7. Push to the branch (`git push origin feature/amazing-feature`)
8. Open a Pull Request

### Documentation Requirements
- All public methods must have JSDoc comments
- Complex logic must be explained with inline comments
- New features require usage examples
- Update README.md if adding new functionality

**Note**: Pull requests without proper code documentation will not be accepted.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

- 📧 Email: asesugh@gmail.com
- 📖 Documentation: [Monnify API Docs](https://developers.monnify.com/api/)
- 🐛 Issues: [GitHub Issues](https://github.com/adsesugh/monnify-nodejs-sdk/issues)

## Changelog

### v1.0.0
- Initial release
- Complete API coverage
- TypeScript support
- Comprehensive error handling
- Production-ready features