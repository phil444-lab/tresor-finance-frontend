export type UserRole = `CpeMSP_cpeclient${1 | 2 | 3 | 4 | 5}` 
  | `TMSP_tclient${1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15}` 
  | `TrRegionMSP_trregionclient${1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10}`;

export interface User {
  id: string;
  fullName: string;
  role: UserRole;
}

export type PaymentStatus = 'pending' | 'success' | 'failed';
export type AggregationStatus = 'waiting_approval' | 'approved' | 'rejected';

export interface Payment {
  id: string;
  chainId: string;
  txId: string;
  blockNumber: string;
  blockHash: string;
  matricule: string;
  fullName: string;
  bankInfo: string;
  montant: number;
  status: PaymentStatus;
  submit: PaymentStatus;
  aggregationStatus: AggregationStatus;
  createdAt: string;
  userId?: string;
  user?: User;
}

export interface Employee {
  id: string;
  matricule: string;
  fullName: string;
  bankInfo: string;
  position: string;
  address: string;
  dateOfBirth: string;
  createdAt: string;
}

export interface DashboardStats {
  paymentsToday: number;
  paymentsPending: number;
  paymentsValidated: number;
  paymentsFailed: number;
  totalAmount: number;
}

export interface AccountingEntry {
  id: number;
  paymentId: number;
  date: string;
  pieceNumber: string;
  account: string;
  description: string;
  debit: number;
  credit: number;
}
