# Changelog

### [v1.0.0] - 2025-09-27
- Initial release with complete Monnify API coverage
- 40+ API methods across all endpoints
- Core features: Transactions, Reserved Accounts, Transfers
- Advanced features: Sub-accounts, Invoices, Refunds, Settlements
- Payment methods: Cards, Bank transfers, USSD, Direct debit
- Business tools: Card tokenization, BVN verification, Payment links
- TypeScript support with comprehensive type definitions
- Production-ready error handling and retry logic
- Comprehensive test suite with 95%+ coverage
- Webhook signature verification
- Automatic token management

## [v1.0.1] - 2025-09-27

🎉 First full-feature release with **complete Monnify API coverage**

### 🚀 Added

* **Sub-Account Management**

  * Create, update, delete sub-accounts
  * List sub-accounts with pagination
* **Invoice Management**

  * Create, get, cancel invoices
  * List invoices with pagination
* **Refund Management**

  * Initiate refunds and check status
* **Settlement Management**

  * Get settlements with pagination
  * Get settlement details
* **Card Tokenization**

  * Tokenize cards for future use
  * Charge tokenized cards
* **Direct Debit**

  * Initiate direct account debits
* **USSD Payments**

  * Generate USSD payment codes
* **Virtual Accounts**

  * Create alternative virtual accounts
* **Merchant Profile**

  * Get and update merchant profile
* **Transaction Statistics**

  * Analytics and performance data
* **BVN Verification**

  * Validate Bank Verification Numbers
* **Payment Links**

  * Create and manage payment links
* **Enhanced Utilities**

  * Search transactions (email/date)
  * Resend webhooks

### 📝 Type Safety

* Comprehensive TypeScript interfaces for all new endpoints
* Consolidated extended types into `types.ts`
* Full IntelliSense support

### 🧪 Tests

* Added test coverage for all APIs
* Includes validation, success, and error handling
* HTTP mocking with Nock

### 🔧 Fixes & Improvements

* Fixed missing type imports (`SubAccountRequest`, `Invoice`)
* Removed duplicate methods (`getTransferStatus`, `getBulkTransferStatus`)
* Added Node.js environment support to ESLint config (`Buffer` fix)
* Lint issues resolved, consistent code style applied

### 📚 Documentation

* Expanded README with:

  * Full API reference & examples
  * Updated features list (40+ endpoints)
  * Changelog entry
  * NPM badges & links

---

✅ The SDK now provides **end-to-end Monnify API support**, fully typed, tested, linted, and documented for production use.
