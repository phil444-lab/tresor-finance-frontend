export type UserRole = 'TMSP' | 'TrRegionMSP' | 'CpeMSP';

export interface User {
  id: string;
  fullName: string;
  role: UserRole;
  email: string;
}

export type PaymentStatus = 'pending' | 'validated' | 'failed';

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
  submit: boolean;
  date: string;
  createdBy: string;
}

export interface PaymentHistory {
  id: string;
  paymentId: string;
  action: string;
  status: PaymentStatus;
  timestamp: string;
  user: string;
  details: string;
}

export interface Employee {
  id: string;
  matricule: string;
  fullName: string;
  fonction: string;
  direction: string;
  email?: string;
  phone?: string;
}

export interface DashboardStats {
  paymentsToday: number;
  paymentsPending: number;
  paymentsValidated: number;
  paymentsFailed: number;
  totalAmount: number;
}
