import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BatchTransferDialog } from '../BatchTransferDialog';
import { useTransactionStore } from '../../store';
import Papa from 'papaparse';
import userEvent from '@testing-library/user-event';
import { ParseConfig, ParseResult } from 'papaparse';

// Mock dependencies
vi.mock('../../store', () => ({
  useTransactionStore: vi.fn(),
}));

vi.mock('papaparse', () => {
  const parseFn = (file: File, options: ParseConfig<any> = {}) => {
    if (options?.complete) {
      const results = {
        data: [],
        errors: [],
        meta: {
          delimiter: ",",
          linebreak: "\n",
          aborted: false,
          truncated: false,
          cursor: 0
        }
      } as unknown as ParseResult<any>;
      options.complete(results, {} as any);
    }
  };

  return {
    default: {
      parse: vi.fn(parseFn)
    },
    parse: vi.fn(parseFn)
  }
});

// Mock MUI components
vi.mock('@mui/material', () => ({
  Dialog: ({ children, open }: any) => open ? <div data-testid="dialog">{children}</div> : null,
  DialogTitle: ({ children }: any) => <div data-testid="dialog-title">{children}</div>,
  DialogContent: ({ children }: any) => <div data-testid="dialog-content">{children}</div>,
  Stepper: ({ children, activeStep }: any) => <div data-testid="stepper" data-active-step={activeStep}>{children}</div>,
  Step: ({ children }: any) => <div data-testid="step">{children}</div>,
  StepLabel: ({ children }: any) => <div data-testid="step-label">{children}</div>,
  Button: ({ children, onClick, disabled }: any) => (
    <button 
      data-testid="button" 
      onClick={onClick} 
      disabled={disabled}
      role="button"
      aria-label={children}
    >
      {children}
    </button>
  ),
  TextField: ({ label, value, onChange, error, helperText, name }: any) => (
    <input
      data-testid={`textfield-${label}`}
      value={value}
      onChange={onChange}
      aria-label={label}
      data-error={error}
      data-helper-text={helperText}
      name={name}
    />
  ),
  FormControl: ({ children }: any) => <div data-testid="form-control">{children}</div>,
  InputLabel: ({ children }: any) => <div data-testid="input-label">{children}</div>,
  Select: ({ value, onChange, children, name }: any) => (
    <select data-testid="select" value={value} onChange={onChange} name={name}>
      {children}
    </select>
  ),
  MenuItem: ({ value, children }: any) => <option value={value}>{children}</option>,
  Typography: ({ children }: any) => <div data-testid="typography">{children}</div>,
  Box: ({ children }: any) => <div data-testid="box">{children}</div>,
}));

vi.mock('@mui/x-data-grid', () => ({
  DataGrid: ({ rows }: any) => (
    <div data-testid="data-grid">
      <span>Total Rows: {rows.length}</span>
    </div>
  ),
}));

describe('BatchTransferDialog', () => {
  const mockAddTransactions = vi.fn();
  const mockAddBatchTransfer = vi.fn();
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useTransactionStore as any).mockImplementation((selector: (state: any) => any) =>
      selector({
        addTransactions: mockAddTransactions,
        addBatchTransfer: mockAddBatchTransfer,
      })
    );
  });

  it('should render dialog when open is true', () => {
    // Act
    render(<BatchTransferDialog open={true} onClose={mockOnClose} />);
    
    // Assert
    expect(screen.getByTestId('dialog')).toBeInTheDocument();
    expect(screen.getByTestId('dialog-title')).toHaveTextContent('Batch Transfer');
  });

  it('should not render dialog when open is false', () => {
    // Act
    render(<BatchTransferDialog open={false} onClose={mockOnClose} />);
    
    // Assert
    expect(screen.queryByTestId('dialog')).not.toBeInTheDocument();
  });

  it('should start at step 0 with Next button disabled', () => {
    // Act
    render(<BatchTransferDialog open={true} onClose={mockOnClose} />);
    
    // Assert
    expect(screen.getByTestId('stepper')).toHaveAttribute('data-active-step', '0');
    expect(screen.getByText('Next')).toBeDisabled();
  });

  it('should validate required fields in step 1', async () => {
    // Arrange
    render(<BatchTransferDialog open={true} onClose={mockOnClose} />);
    const batchNameInput = screen.getByTestId('textfield-Batch Transfer Name');
    
    // Act
    await userEvent.type(batchNameInput, 'Test Batch');
    
    // Assert
    expect(screen.getByText('Next')).toBeDisabled(); // Still disabled because approver not selected
  });

  it('should handle file upload and parse CSV', async () => {
    // Arrange
    const mockCSVData = [
      {
        'Transaction Date': '2024-03-17',
        'Account Number': '000-000000000-00',
        'Account Holder Name': 'John Doe',
        'Amount': '1000',
      },
    ];

    (Papa.parse as any).mockImplementation((file: File, options: ParseConfig<any> = {}) => {
      if (options?.complete) {
        const results = {
          data: mockCSVData,
          errors: [],
          meta: {
            delimiter: ",",
            linebreak: "\n",
            aborted: false,
            truncated: false,
            cursor: 0
          }
        } as unknown as ParseResult<any>;
        options.complete(results, {} as any);
      }
    });

    render(<BatchTransferDialog open={true} onClose={mockOnClose} />);

    // Act
    const file = new File(['csv content'], 'test.csv', { type: 'text/csv' });
    const fileInput = screen.getByLabelText('Upload CSV');
    await userEvent.upload(fileInput, file);

    // Assert
    expect(Papa.parse).toHaveBeenCalled();
  });

  it('should submit batch when all steps are completed', async () => {
    // Arrange
    const mockCSVData = [
      {
        'Transaction Date': '2024-03-17',
        'Account Number': '000-000000000-00',
        'Account Holder Name': 'John Doe',
        'Amount': '1000',
      },
    ];

    (Papa.parse as any).mockImplementation((file: File, options: ParseConfig<any> = {}) => {
      if (options?.complete) {
        const results = {
          data: mockCSVData,
          errors: [],
          meta: {
            delimiter: ",",
            linebreak: "\n",
            aborted: false,
            truncated: false,
            cursor: 0
          }
        } as unknown as ParseResult<any>;
        options.complete(results, {} as any);
      }
    });

    const { container } = render(<BatchTransferDialog open={true} onClose={mockOnClose} />);

    // Act - Complete Step 1
    await userEvent.type(screen.getByTestId('textfield-Batch Transfer Name'), 'Test Batch');
    await userEvent.selectOptions(screen.getByTestId('select'), 'John Smith');
    
    const file = new File(['csv content'], 'test.csv', { type: 'text/csv' });
    const fileInput = screen.getByLabelText('Upload CSV');
    await userEvent.upload(fileInput, file);

    // Wait for the Next button to be enabled after file upload
    await waitFor(
      () => {
        const nextButton = screen.getByRole('button', { name: 'Next' });
        expect(nextButton).not.toBeDisabled();
      },
      { timeout: 1000 }
    );

    // Navigate through steps
    await userEvent.click(screen.getByRole('button', { name: 'Next' }));
    
    // Wait for validation to complete and check for validation errors
    await waitFor(
      () => {
        // Check if there are no validation errors
        const validationErrors = screen.queryByText(/Invalid account number format/);
        expect(validationErrors).not.toBeInTheDocument();
      },
      { timeout: 1000 }
    );

    // Now that validation is successful, the Next button should be enabled
    const nextButton = screen.getByRole('button', { name: 'Next' });
    expect(nextButton).not.toBeDisabled();
    await userEvent.click(nextButton);
    
    // Submit in final step
    await waitFor(
      () => {
        const submitButton = screen.getByRole('button', { name: 'Submit' });
        expect(submitButton).toBeInTheDocument();
        expect(submitButton).not.toBeDisabled();
      },
      { timeout: 1000 }
    );
    await userEvent.click(screen.getByRole('button', { name: 'Submit' }));

    // Assert
    await waitFor(
      () => {
        expect(mockAddTransactions).toHaveBeenCalled();
        expect(mockAddBatchTransfer).toHaveBeenCalled();
        expect(mockOnClose).toHaveBeenCalled();
      },
      { timeout: 1000 }
    );
  });
}); 