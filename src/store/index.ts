import { create } from 'zustand';
import { Transaction, BatchTransfer } from '../types';

interface TransactionStore {
  transactions: Transaction[];
  addTransactions: (transactions: Transaction[]) => void;
  updateTransaction: (index: number, transaction: Transaction) => void;
  batchTransfers: BatchTransfer[];
  addBatchTransfer: (batchTransfer: BatchTransfer) => void;
}

export const useTransactionStore = create<TransactionStore>((set) => ({
  transactions: [],
  batchTransfers: [],
  addTransactions: (newTransactions) =>
    set((state) => ({
      transactions: [...state.transactions, ...newTransactions],
    })),
  updateTransaction: (index, updatedTransaction) =>
    set((state) => ({
      transactions: state.transactions.map((t, i) =>
        i === index ? updatedTransaction : t
      ),
    })),
  addBatchTransfer: (batchTransfer) =>
    set((state) => ({
      batchTransfers: [...state.batchTransfers, batchTransfer],
    })),
})); 