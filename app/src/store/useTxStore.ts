import { create } from 'zustand';

export interface SolanaTx {
  signature: string;
  type: string;
  description: string;
  timestamp: number;
}

interface TxState {
  transactions: SolanaTx[];
  addTx: (tx: SolanaTx) => void;
  clearTxs: () => void;
}

export const useTxStore = create<TxState>((set) => ({
  transactions: [],
  addTx: (tx) => set((s) => ({ transactions: [tx, ...s.transactions] })),
  clearTxs: () => set({ transactions: [] }),
}));
