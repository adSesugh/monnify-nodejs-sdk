# API Documentation

## MonnifySDK Class

### Constructor

```typescript
new MonnifySDK(config: MonnifyConfig)
```

### Methods

#### Transaction APIs
- `initializeTransaction(request: TransactionRequest): Promise<MonnifyResponse<Transaction>>`
- `getTransactionStatus(transactionReference: string): Promise<MonnifyResponse<Transaction>>`
- `getAllTransactions(page?: number, size?: number): Promise<MonnifyResponse<{content: Transaction[]}>>`

#### Reserved Account APIs
- `createReservedAccount(request: ReservedAccountRequest): Promise<MonnifyResponse<ReservedAccount>>`
- `getReservedAccountDetails(accountReference: string): Promise<MonnifyResponse<ReservedAccount>>`
- `updateReservedAccount(accountReference: string, customerName: string, customerEmail: string): Promise<MonnifyResponse<ReservedAccount>>`
- `deleteReservedAccount(accountReference: string): Promise<MonnifyResponse<void>>`
- `getReservedAccountTransactions(accountReference: string, page?: number, size?: number): Promise<MonnifyResponse<{content: Transaction[]}>>`

#### Transfer APIs
- `initiateSingleTransfer(request: TransferRequest): Promise<MonnifyResponse<TransferStatus>>`
- `initiateBulkTransfer(request: BulkTransferRequest): Promise<MonnifyResponse<BulkTransferStatus>>`
- `getTransferStatus(reference: string): Promise<MonnifyResponse<TransferStatus>>`
- `getBulkTransferStatus(batchReference: string): Promise<MonnifyResponse<BulkTransferStatus>>`

#### Utility APIs
- `getBanks(): Promise<MonnifyResponse<Bank[]>>`
- `verifyBankAccount(bankCode: string, accountNumber: string): Promise<MonnifyResponse<AccountDetails>>`
- `getWalletBalance(walletId?: string): Promise<MonnifyResponse<WalletBalance>>`

#### Webhook Verification
- `verifyWebhookSignature(payload: string, signature: string): boolean`