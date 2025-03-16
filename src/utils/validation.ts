import { ValidationError, CSVRecord } from '../types';
import { parse, isValid } from 'date-fns';

export const validateTransaction = (record: CSVRecord, rowIndex: number): ValidationError[] => {
  const errors: ValidationError[] = [];

  // Validate Transaction Date
  const date = parse(record['Transaction Date'], 'yyyy-MM-dd', new Date());
  if (!isValid(date)) {
    errors.push({
      row: rowIndex,
      field: 'Transaction Date',
      message: 'Invalid date format. Use YYYY-MM-DD',
    });
  }

  // Validate Account Number
  const accountNumberPattern = /^000-\d{9}-\d{2}$/;
  if (!accountNumberPattern.test(record['Account Number'])) {
    errors.push({
      row: rowIndex,
      field: 'Account Number',
      message: 'Invalid account number format. Use 000-000000000-00',
    });
  }

  // Validate Account Holder Name
  if (!record['Account Holder Name']?.trim()) {
    errors.push({
      row: rowIndex,
      field: 'Account Holder Name',
      message: 'Account holder name cannot be empty',
    });
  }

  // Validate Amount
  const amount = parseFloat(record['Amount']);
  if (isNaN(amount) || amount <= 0) {
    errors.push({
      row: rowIndex,
      field: 'Amount',
      message: 'Amount must be a positive number',
    });
  }

  return errors;
};

export const validateCSVFormat = (headers: string[]): boolean => {
  const requiredHeaders = [
    'Transaction Date',
    'Account Number',
    'Account Holder Name',
    'Amount',
  ];

  return requiredHeaders.every((header) => headers.includes(header));
}; 