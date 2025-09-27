import 'dotenv/config';
import MonnifySDK, { MonnifyError } from '../src';

// Initialize SDK
const monnify = new MonnifySDK({
  contractCode: process.env.MONNIFY_CONTRACT_CODE!,
  secretKey: process.env.MONNIFY_SECRET_KEY!,
  apiKey: process.env.MONNIFY_API_KEY!,
  baseURL: 'https://sandbox.monnify.com' // Use sandbox for testing
});

async function basicUsageExample() {
  try {
    // 1. Initialize a transaction
    console.log('1. Initializing transaction...');
    const transaction = await monnify.initializeTransaction({
      amount: 10000, // NGN 100.00 in kobo
      customerName: 'John Doe',
      customerEmail: 'john@example.com',
      paymentReference: `PAY-${Date.now()}`,
      paymentDescription: 'Test payment'
    });
    
    console.log('Transaction initialized:', {
      reference: transaction.responseBody.transactionReference,
      checkoutUrl: transaction.responseBody.checkoutUrl
    });

    // 2. Create a reserved account
    console.log('\n2. Creating reserved account...');
    const account = await monnify.createReservedAccount({
      accountReference: `ACC-${Date.now()}`,
      accountName: 'John Doe Wallet',
      currencyCode: 'NGN',
      customerEmail: 'john@example.com',
      customerName: 'John Doe'
    });
    
    console.log('Reserved account created:', {
      reference: account.responseBody.accountReference,
      accounts: account.responseBody.accounts
    });

    // 3. Get banks list
    console.log('\n3. Getting banks list...');
    const banks = await monnify.getBanks();
    console.log(`Found ${banks.responseBody.length} banks`);

    // 4. Verify a bank account
    console.log('\n4. Verifying bank account...');
    const verification = await monnify.verifyBankAccount('044', '0123456789');
    console.log('Account verification:', verification.responseBody);

    // 5. Get wallet balance
    console.log('\n5. Getting wallet balance...');
    const balance = await monnify.getWalletBalance();
    console.log('Wallet balance:', balance.responseBody);

  } catch (error) {
    if (error instanceof MonnifyError) {
      console.error('Monnify Error:', {
        message: error.message,
        code: error.code,
        statusCode: error.statusCode
      });
    } else {
      console.error('Unexpected error:', error);
    }
  }
}

// Run the example
basicUsageExample();