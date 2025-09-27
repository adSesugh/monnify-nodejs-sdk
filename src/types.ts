export interface MonnifyConfig {
  contractCode: string;
  secretKey: string;
  apiKey: string;
  baseURL?: string;
}

export interface MonnifyResponse<T = any> {
  requestSuccessful: boolean;
  responseMessage: string;
  responseCode: string;
  responseBody: T;
}

export interface AuthResponse {
  requestSuccessful: boolean;
  responseMessage: string;
  responseCode: string;
  responseBody: {
    accessToken: string;
    expiresIn: number;
  };
}

export interface TransactionRequest {
  amount: number;
  customerName: string;
  customerEmail: string;
  paymentReference: string;
  paymentDescription: string;
  currencyCode?: string;
  contractCode?: string;
  redirectUrl?: string;
  paymentMethods?: string[];
  incomeSplitConfig?: IncomeSplitConfig[];
}

export interface IncomeSplitConfig {
  subAccountCode: string;
  feePercentage?: number;
  splitAmount?: number;
  feeBearer?: boolean;
}

export interface ReservedAccountRequest {
  accountReference: string;
  accountName: string;
  currencyCode: string;
  contractCode?: string;
  customerEmail: string;
  customerName?: string;
  getAllAvailableBanks?: boolean;
  preferredBanks?: string[];
}

export interface TransferRequest {
  amount: number;
  reference: string;
  narration: string;
  destinationBankCode: string;
  destinationAccountNumber: string;
  currency?: string;
  sourceAccountNumber?: string;
}

export interface BulkTransferRequest {
  title: string;
  batchReference: string;
  narration: string;
  sourceAccountNumber: string;
  onValidationFailure: 'BREAK' | 'CONTINUE';
  notificationInterval: number;
  transactionList: TransferRequest[];
}

export interface Bank {
  name: string;
  code: string;
  ussdTemplate?: string;
  baseUssdCode?: string;
  transferUssdTemplate?: string;
}

export interface AccountDetails {
  accountNumber: string;
  accountName: string;
  bankCode: string;
  bankName: string;
}

export interface Transaction {
  transactionReference: string;
  paymentReference: string;
  amountPaid: number;
  totalPayable: number;
  settlementAmount: number;
  paidOn: string;
  paymentStatus: string;
  paymentDescription: string;
  currency: string;
  paymentMethod: string;
  checkoutUrl?: string;
  product: {
    type: string;
    reference: string;
  };
  cardDetails?: {
    cardType: string;
    last4: string;
    expMonth: string;
    expYear: string;
    bin: string;
    reusable: boolean;
  };
  accountDetails?: {
    accountName: string;
    accountNumber: string;
    bankCode: string;
    amountPaid: number;
  };
}

export interface ReservedAccount {
  contractCode: string;
  accountReference: string;
  accountName: string;
  currencyCode: string;
  customerEmail: string;
  customerName: string;
  accounts: AccountDetails[];
  collectionChannel: string;
  reservationReference: string;
  reservedAccountType: string;
  status: string;
  createdOn: string;
  contract: {
    name: string;
    code: string;
    description: string;
  };
}

export interface WalletBalance {
  availableBalance: number;
  ledgerBalance: number;
}

export interface TransferStatus {
  amount: number;
  reference: string;
  status: string;
  dateCreated: string;
  totalFee: number;
  destinationAccountName: string;
  destinationAccountNumber: string;
  destinationBankName: string;
  destinationBankCode: string;
}

export interface BulkTransferStatus {
  title: string;
  batchReference: string;
  batchStatus: string;
  totalAmount: number;
  totalFee: number;
  totalTransactions: number;
  validTransactions: number;
  invalidTransactions: number;
  pendingTransactions: number;
  successfulTransactions: number;
  failedTransactions: number;
}

// Sub-Account Management
export interface SubAccountRequest {
  subAccountCode: string;
  businessName: string;
  businessEmail: string;
  businessMobile: string;
  businessAddress: string;
  percentageCommission: number;
}

export interface SubAccount {
  subAccountCode: string;
  businessName: string;
  businessEmail: string;
  businessMobile: string;
  businessAddress: string;
  percentageCommission: number;
  status: string;
  dateCreated: string;
}

// Invoice Management
export interface InvoiceRequest {
  amount: number;
  invoiceReference: string;
  description: string;
  customerName: string;
  customerEmail: string;
  expiryDate?: string;
  redirectUrl?: string;
}

export interface Invoice {
  invoiceReference: string;
  amount: number;
  description: string;
  customerName: string;
  customerEmail: string;
  status: string;
  expiryDate: string;
  dateCreated: string;
  invoiceUrl: string;
}

// Refund Management
export interface RefundRequest {
  transactionReference: string;
  refundAmount: number;
  refundReference: string;
  customerNote?: string;
  destinationAccountNumber?: string;
  destinationBankCode?: string;
}

export interface Refund {
  refundReference: string;
  transactionReference: string;
  refundAmount: number;
  refundStatus: string;
  refundDate: string;
  customerNote?: string;
}

// Settlement Management
export interface Settlement {
  settlementId: string;
  settlementDate: string;
  totalAmount: number;
  totalTransactions: number;
  status: string;
}

// Card Tokenization
export interface CardTokenRequest {
  pan: string;
  expiryMonth: string;
  expiryYear: string;
  cvv: string;
  pin?: string;
}

export interface CardToken {
  token: string;
  maskedPan: string;
  expiryMonth: string;
  expiryYear: string;
  cardType: string;
}

// Direct Debit
export interface DirectDebitRequest {
  accountNumber: string;
  bankCode: string;
  amount: number;
  narration: string;
  reference: string;
}

// USSD Payment
export interface USSDPaymentRequest {
  amount: number;
  customerName: string;
  customerEmail: string;
  paymentReference: string;
  paymentDescription: string;
  bankCode: string;
}

// Virtual Account
export interface VirtualAccountRequest {
  accountName: string;
  currencyCode: string;
  accountReference: string;
  customerName: string;
  customerEmail: string;
  bvn?: string;
}

// Merchant Profile
export interface MerchantProfile {
  merchantCode: string;
  merchantName: string;
  merchantEmail: string;
  merchantMobile: string;
  businessType: string;
  status: string;
  dateCreated: string;
}

// Transaction Statistics
export interface TransactionStats {
  totalTransactions: number;
  totalAmount: number;
  successfulTransactions: number;
  failedTransactions: number;
  pendingTransactions: number;
  period: string;
}

// BVN Verification
export interface BVNVerificationRequest {
  bvn: string;
  name: string;
  dateOfBirth: string;
  mobileNumber: string;
}

export interface BVNVerification {
  bvn: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  mobileNumber: string;
  verificationStatus: string;
}

// Payment Link
export interface PaymentLinkRequest {
  amount: number;
  description: string;
  redirectUrl?: string;
  customerName?: string;
  customerEmail?: string;
}

export interface PaymentLink {
  paymentReference: string;
  checkoutUrl: string;
  amount: number;
  description: string;
  status: string;
  dateCreated: string;
}