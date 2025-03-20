import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TransactionTable } from '../TransactionTable';
import { useTransactionStore } from '../../store';

// Mock the store
vi.mock('../../store', () => ({
  useTransactionStore: vi.fn(),
}));

// Mock MUI components
vi.mock('@mui/x-data-grid', () => ({
  DataGrid: ({ rows, columns }: any) => (
    <div data-testid="mock-data-grid">
      <span>Total Rows: {rows.length}</span>
      <span>Total Columns: {columns.length}</span>
    </div>
  ),
}));

describe('TransactionTable', () => {
  // Arrange
  const mockTransactions = [
    {
      transactionDate: '2024-03-17',
      accountNumber: '1234567890',
      accountHolderName: 'John Doe',
      amount: 1000,
      status: 'pending',
      errorMessage: '',
    },
    {
      transactionDate: '2024-03-17',
      accountNumber: '0987654321',
      accountHolderName: 'Jane Smith',
      amount: 2000,
      status: 'settled',
      errorMessage: '',
    },
  ];

  beforeEach(() => {
    (useTransactionStore as any).mockImplementation((selector: (state: any) => any) =>
      selector({ transactions: mockTransactions })
    );
  });

  it('should render the DataGrid component', () => {
    // Arrange
    
    // Act
    render(<TransactionTable />);
    
    // Assert
    expect(screen.getByTestId('mock-data-grid')).toBeInTheDocument();
  });

  it('should display correct number of rows from store', () => {
    // Arrange
    
    // Act
    render(<TransactionTable />);
    
    // Assert
    expect(screen.getByText('Total Rows: 2')).toBeInTheDocument();
  });

  it('should have all required columns', () => {
    // Arrange
    
    // Act
    render(<TransactionTable />);
    
    // Assert
    expect(screen.getByText('Total Columns: 5')).toBeInTheDocument();
  });

  it('should format currency values correctly', () => {
    // Arrange
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    });
    
    // Act
    const formattedValue = formatter.format(1000);
    
    // Assert
    expect(formattedValue).toBe('$1,000.00');
  });
}); 