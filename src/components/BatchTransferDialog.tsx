import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Stepper,
  Step,
  StepLabel,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Box,
} from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import Papa from 'papaparse';
import { DataGrid } from '@mui/x-data-grid';
import { Transaction, CSVRecord, ValidationError } from '../types';
import { validateTransaction, validateCSVFormat } from '../utils/validation';
import { useTransactionStore } from '../store';

const MOCK_APPROVERS = [
  'John Smith',
  'Jane Doe',
  'Michael Johnson',
  'Sarah Williams',
  'Robert Brown',
];

interface BatchTransferDialogProps {
  open: boolean;
  onClose: () => void;
}

const steps = ['Transfer Details', 'Review Records', 'Summary'];

export const BatchTransferDialog: React.FC<BatchTransferDialogProps> = ({
  open,
  onClose,
}) => {
  const [activeStep, setActiveStep] = useState(0);
  const [parsedTransactions, setParsedTransactions] = useState<Transaction[]>([]);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const addTransactions = useTransactionStore((state) => state.addTransactions);
  const addBatchTransfer = useTransactionStore((state) => state.addBatchTransfer);

  const formik = useFormik({
    initialValues: {
      batchName: '',
      approver: '',
      file: null as File | null,
    },
    validationSchema: Yup.object({
      batchName: Yup.string().required('Batch name is required'),
      approver: Yup.string().required('Approver is required'),
    }),
    onSubmit: () => {
      handleNext();
    },
  });

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      formik.setFieldValue('file', file);
      Papa.parse(file, {
        header: true,
        complete: (results) => {
          const headers = Object.keys(results.data[0] || {});
          if (!validateCSVFormat(headers)) {
            setValidationErrors([
              {
                row: 0,
                field: 'format',
                message: 'Invalid CSV format. Please check the column headers.',
              },
            ]);
            return;
          }

          const errors: ValidationError[] = [];
          const transactions: Transaction[] = [];

          results.data.forEach((record: CSVRecord, index) => {
            const recordErrors = validateTransaction(record, index + 1);
            if (recordErrors.length > 0) {
              errors.push(...recordErrors);
            } else {
              transactions.push({
                transactionDate: record['Transaction Date'],
                accountNumber: record['Account Number'],
                accountHolderName: record['Account Holder Name'],
                amount: parseFloat(record['Amount']),
                status: 'pending',
              });
            }
          });

          setParsedTransactions(transactions);
          setValidationErrors(errors);
        },
      });
    }
  };

  const handleNext = () => {
    if (activeStep === steps.length - 1) {
      // Submit the batch
      const totalAmount = parsedTransactions.reduce((sum, t) => sum + t.amount, 0);
      addTransactions(parsedTransactions);
      addBatchTransfer({
        name: formik.values.batchName,
        approver: formik.values.approver,
        transactions: parsedTransactions,
        totalAmount,
        numberOfPayments: parsedTransactions.length,
        averagePaymentValue: totalAmount / parsedTransactions.length,
      });
      onClose();
    } else {
      setActiveStep((prevStep) => prevStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              id="batchName"
              name="batchName"
              label="Batch Transfer Name"
              value={formik.values.batchName}
              onChange={formik.handleChange}
              error={formik.touched.batchName && Boolean(formik.errors.batchName)}
              helperText={formik.touched.batchName && formik.errors.batchName}
              sx={{ mb: 2 }}
              inputProps={{
                'aria-label': 'Batch Transfer Name',
                'data-testid': 'textfield-Batch Transfer Name',
                name: 'batchName'
              }}
            />
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Approver</InputLabel>
              <Select
                id="approver"
                name="approver"
                label="Approver"
                value={formik.values.approver}
                onChange={formik.handleChange}
                error={formik.touched.approver && Boolean(formik.errors.approver)}
                inputProps={{
                  name: 'approver'
                }}
              >
                {MOCK_APPROVERS.map((approver) => (
                  <MenuItem key={approver} value={approver}>
                    {approver}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Button variant="contained" component="label">
              Upload CSV
              <input
                type="file"
                hidden
                accept=".csv"
                onChange={handleFileUpload}
                id="csv-upload"
                aria-label="Upload CSV"
              />
            </Button>
          </Box>
        );
      case 1:
        return (
          <Box sx={{ mt: 2 }}>
            {validationErrors.length > 0 ? (
              <Box sx={{ mb: 2 }}>
                <Typography color="error" variant="h6">
                  Validation Errors
                </Typography>
                {validationErrors.map((error, index) => (
                  <Typography key={index} color="error">
                    Row {error.row}: {error.field} - {error.message}
                  </Typography>
                ))}
              </Box>
            ) : (
              <DataGrid
                rows={parsedTransactions.map((t, index) => ({ ...t, id: index }))}
                columns={[
                  { field: 'transactionDate', headerName: 'Date', flex: 1 },
                  { field: 'accountNumber', headerName: 'Account', flex: 1 },
                  {
                    field: 'accountHolderName',
                    headerName: 'Name',
                    flex: 1,
                  },
                  {
                    field: 'amount',
                    headerName: 'Amount',
                    flex: 1,
                    valueFormatter: (params) =>
                      new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: 'USD',
                      }).format(params),
                  },
                ]}
                autoHeight
              />
            )}
          </Box>
        );
      case 2:
        const totalAmount = parsedTransactions.reduce(
          (sum, t) => sum + t.amount,
          0
        );
        return (
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6">Batch Transfer Summary</Typography>
            <Typography>Name: {formik.values.batchName}</Typography>
            <Typography>Approver: {formik.values.approver}</Typography>
            <Typography>
              Total Amount:{' '}
              {new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
              }).format(totalAmount)}
            </Typography>
            <Typography>
              Number of Payments: {parsedTransactions.length}
            </Typography>
            <Typography>
              Average Payment Value:{' '}
              {new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
              }).format(totalAmount / parsedTransactions.length)}
            </Typography>
          </Box>
        );
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Batch Transfer</DialogTitle>
      <DialogContent>
        <Stepper activeStep={activeStep} sx={{ pt: 3, pb: 5 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        {renderStepContent(activeStep)}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
          <Button sx={{ mr: 1 }} onClick={handleBack} disabled={activeStep === 0}>
            Back
          </Button>
          <Button
            variant="contained"
            onClick={handleNext}
            disabled={
              (activeStep === 0 &&
                (!formik.values.batchName ||
                  !formik.values.approver ||
                  !formik.values.file)) ||
              (activeStep === 1 && validationErrors.length > 0)
            }
          >
            {activeStep === steps.length - 1 ? 'Submit' : 'Next'}
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
}; 