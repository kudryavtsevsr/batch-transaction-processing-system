export interface Transaction {
  transactionDate: string;
  accountNumber: string;
  accountHolderName: string;
  amount: number;
  status: 'pending' | 'settled' | 'failed';
  errorMessage?: string;
}

export interface BatchTransfer {
  name: string;
  approver: string;
  transactions: Transaction[];
  totalAmount: number;
  numberOfPayments: number;
  averagePaymentValue: number;
}

export interface ValidationError {
  row: number;
  field: string;
  message: string;
}

export interface CSVRecord {
  'Transaction Date': string;
  'Account Number': string;
  'Account Holder Name': string;
  'Amount': string;
} 