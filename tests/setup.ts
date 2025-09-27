// Test configuration setup
export const getTestConfig = () => ({
  contractCode: process.env.MONNIFY_CONTRACT_CODE || 'TEST_CONTRACT',
  secretKey: process.env.MONNIFY_SECRET_KEY || 'TEST_SECRET',
  apiKey: process.env.MONNIFY_API_KEY || 'TEST_API_KEY',
  baseURL: process.env.MONNIFY_BASE_URL || 'https://sandbox.monnify.com'
});