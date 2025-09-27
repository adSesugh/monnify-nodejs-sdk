import express from 'express';
import MonnifySDK from '../src';

const app = express();
app.use(express.json());

const monnify = new MonnifySDK({
  contractCode: process.env.MONNIFY_CONTRACT_CODE!,
  secretKey: process.env.MONNIFY_SECRET_KEY!,
  apiKey: process.env.MONNIFY_API_KEY!
});

// Webhook endpoint
app.post('/webhook/monnify', (req, res) => {
  try {
    const signature = req.headers['monnify-signature'] as string;
    const payload = JSON.stringify(req.body);
    
    // Verify webhook signature
    const isValid = monnify.verifyWebhookSignature(payload, signature);
    
    if (!isValid) {
      console.log('Invalid webhook signature');
      return res.status(400).json({ error: 'Invalid signature' });
    }
    
    // Process webhook based on event type
    const { eventType, eventData } = req.body;
    
    switch (eventType) {
      case 'SUCCESSFUL_TRANSACTION':
        handleSuccessfulTransaction(eventData);
        break;
      case 'FAILED_TRANSACTION':
        handleFailedTransaction(eventData);
        break;
      case 'SUCCESSFUL_DISBURSEMENT':
        handleSuccessfulDisbursement(eventData);
        break;
      case 'FAILED_DISBURSEMENT':
        handleFailedDisbursement(eventData);
        break;
      default:
        console.log('Unknown event type:', eventType);
    }
    
    res.status(200).json({ message: 'Webhook processed successfully' });
    
  } catch (error) {
    console.error('Webhook processing error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

function handleSuccessfulTransaction(data: any) {
  console.log('Successful transaction:', {
    reference: data.transactionReference,
    amount: data.amountPaid,
    customer: data.customer
  });
  
  // Update your database, send confirmation email, etc.
}

function handleFailedTransaction(data: any) {
  console.log('Failed transaction:', {
    reference: data.transactionReference,
    reason: data.paymentStatus
  });
  
  // Handle failed payment
}

function handleSuccessfulDisbursement(data: any) {
  console.log('Successful disbursement:', {
    reference: data.reference,
    amount: data.amount
  });
  
  // Update disbursement status
}

function handleFailedDisbursement(data: any) {
  console.log('Failed disbursement:', {
    reference: data.reference,
    reason: data.status
  });
  
  // Handle failed disbursement
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Webhook server running on port ${PORT}`);
});