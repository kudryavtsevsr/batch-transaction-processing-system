import React, { useState } from 'react';
import {
  Container,
  Typography,
  Button,
  Box,
  AppBar,
  Toolbar,
} from '@mui/material';
import { TransactionTable } from './components/TransactionTable';
import { BatchTransferDialog } from './components/BatchTransferDialog';

function App() {
  const [isBatchDialogOpen, setIsBatchDialogOpen] = useState(false);

  return (
    <Box sx={{ width: '100%', minHeight: '100vh', bgcolor: '#f5f5f5' }}>
      <AppBar position="static" elevation={0}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Batch Transaction Processing System
          </Typography>
        </Toolbar>
      </AppBar>
      <Container maxWidth={false} sx={{ mt: 3, px: { xs: 2, sm: 3 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, width: '100%' }}>
          <Typography variant="h5">Transactions</Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => setIsBatchDialogOpen(true)}
          >
            Batch Transfer
          </Button>
        </Box>
        <Box sx={{ width: '100%', height: '100%' }}>
          <TransactionTable />
        </Box>
        <BatchTransferDialog
          open={isBatchDialogOpen}
          onClose={() => setIsBatchDialogOpen(false)}
        />
      </Container>
    </Box>
  );
}

export default App;
