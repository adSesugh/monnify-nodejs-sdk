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