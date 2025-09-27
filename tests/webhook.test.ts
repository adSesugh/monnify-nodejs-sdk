import MonnifySDK, { MonnifyError } from '../src';
import { createHash } from 'crypto';
import { getTestConfig } from './setup';

describe('Webhook Verification', () => {
  let sdk: MonnifySDK;
  const mockConfig = getTestConfig();

  beforeEach(() => {
    sdk = new MonnifySDK(mockConfig);
  });

  describe('verifyWebhookSignature', () => {
    const mockPayload = JSON.stringify({
      eventType: 'SUCCESSFUL_TRANSACTION',
      eventData: {
        transactionReference: 'TXN-123',
        paymentReference: 'PAY-123',
        amountPaid: 10000,
        paymentStatus: 'PAID'
      }
    });

    it('should verify valid webhook signature', () => {
      // Create valid signature
      const validSignature = createHash('sha512')
        .update(mockPayload + mockConfig.secretKey)
        .digest('hex');

      const isValid = sdk.verifyWebhookSignature(mockPayload, validSignature);
      expect(isValid).toBe(true);
    });

    it('should reject invalid webhook signature', () => {
      const invalidSignature = 'invalid_signature_hash';
      
      const isValid = sdk.verifyWebhookSignature(mockPayload, invalidSignature);
      expect(isValid).toBe(false);
    });

    it('should reject signature with wrong secret key', () => {
      // Create signature with wrong secret
      const wrongSignature = createHash('sha512')
        .update(mockPayload + 'WRONG_SECRET')
        .digest('hex');

      const isValid = sdk.verifyWebhookSignature(mockPayload, wrongSignature);
      expect(isValid).toBe(false);
    });

    it('should throw error for empty payload', () => {
      expect(() => {
        sdk.verifyWebhookSignature('', 'some_signature');
      }).toThrow(MonnifyError);
    });

    it('should throw error for empty signature', () => {
      expect(() => {
        sdk.verifyWebhookSignature(mockPayload, '');
      }).toThrow(MonnifyError);
    });

    it('should handle different payload formats', () => {
      const differentPayload = JSON.stringify({
        eventType: 'FAILED_TRANSACTION',
        eventData: {
          transactionReference: 'TXN-456',
          paymentStatus: 'FAILED'
        }
      });

      const validSignature = createHash('sha512')
        .update(differentPayload + mockConfig.secretKey)
        .digest('hex');

      const isValid = sdk.verifyWebhookSignature(differentPayload, validSignature);
      expect(isValid).toBe(true);
    });

    it('should be case sensitive for signature verification', () => {
      const validSignature = createHash('sha512')
        .update(mockPayload + mockConfig.secretKey)
        .digest('hex');

      // Convert to uppercase (should fail)
      const uppercaseSignature = validSignature.toUpperCase();
      
      const isValid = sdk.verifyWebhookSignature(mockPayload, uppercaseSignature);
      expect(isValid).toBe(false);
    });

    it('should handle special characters in payload', () => {
      const specialPayload = JSON.stringify({
        eventType: 'SUCCESSFUL_TRANSACTION',
        eventData: {
          customerName: 'John O\'Connor & Jane Doe',
          narration: 'Payment for "Premium" service (50% discount)'
        }
      });

      const validSignature = createHash('sha512')
        .update(specialPayload + mockConfig.secretKey)
        .digest('hex');

      const isValid = sdk.verifyWebhookSignature(specialPayload, validSignature);
      expect(isValid).toBe(true);
    });
  });
});