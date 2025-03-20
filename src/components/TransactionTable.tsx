import React from 'react';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { Tooltip, Box } from '@mui/material';
import { useTransactionStore } from '../store';

const columns: GridColDef[] = [
  {
    field: 'transactionDate',
    headerName: 'Transaction Date',
    flex: 1,
    minWidth: 150,
  },
  {
    field: 'accountNumber',
    headerName: 'Account Number',
    flex: 1,
    minWidth: 180,
  },
  {
    field: 'accountHolderName',
    headerName: 'Account Holder Name',
    flex: 1,
    minWidth: 180,
  },
  {
    field: 'amount',
    headerName: 'Amount',
    flex: 1,
    minWidth: 120,
    valueFormatter: (params) => {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      }).format(params);
    },
  },
  {
    field: 'status',
    headerName: 'Status',
    flex: 1,
    minWidth: 120,
    renderCell: (params) => {
      const statusColors = {
        pending: '#FFC107',
        settled: '#4CAF50',
        failed: '#F44336',
      };

      return (
        <Tooltip title={params.row.errorMessage || ''}>
          <div
            style={{
              backgroundColor: statusColors[params.value as keyof typeof statusColors],
              padding: '4px 8px',
              borderRadius: '4px',
              color: 'white',
              textTransform: 'capitalize',
            }}
          >
            {params.value}
          </div>
        </Tooltip>
      );
    },
  },
];

export const TransactionTable: React.FC = () => {
  const transactions = useTransactionStore((state) => state.transactions);

  return (
    <Box sx={{ width: '100%', height: 600, bgcolor: 'white', borderRadius: 1 }}>
      <DataGrid
        rows={transactions.map((t, index) => ({ ...t, id: index }))}
        columns={columns}
        pageSizeOptions={[10, 25, 50]}
        initialState={{
          pagination: { paginationModel: { pageSize: 10 } },
        }}
        sx={{
          '& .MuiDataGrid-root': {
            border: 'none',
          },
          '& .MuiDataGrid-cell': {
            borderBottom: '1px solid #f0f0f0',
          },
          '& .MuiDataGrid-columnHeaders': {
            backgroundColor: '#fafafa',
            borderBottom: '2px solid #f0f0f0',
          },
        }}
      />
    </Box>
  );
}; 