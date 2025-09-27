// Basic test structure for the SDK
// TODO: Add comprehensive tests using Jest or similar testing framework

import MonnifySDK, { MonnifyError } from '../src';

describe('MonnifySDK', () => {
  test('should throw error for missing configuration', () => {
    expect(() => {
      new MonnifySDK({} as any);
    }).toThrow(MonnifyError);
  });

  test('should create instance with valid configuration', () => {
    const sdk = new MonnifySDK({
      contractCode: 'test',
      secretKey: 'test',
      apiKey: 'test'
    });
    
    expect(sdk).toBeInstanceOf(MonnifySDK);
  });
});