export interface AccountingEntry {
  id: string;
  date: string;
  entryNumber: string;
  debit: number;
  credit: number;
  description: string;
  agent: string;
  paymentId: string;
}

export const mockAccountingEntries: AccountingEntry[] = [
  // Payment 1 entries
  {
    id: 'ae1',
    date: '2025-11-23T10:30:00',
    entryNumber: 'ECR-2025-001234',
    debit: 0,
    credit: 3500.50,
    description: 'Engagement de dépense - Salaire Ahmed Ben Ali',
    agent: 'Jean Dupont',
    paymentId: '1'
  },
  {
    id: 'ae2',
    date: '2025-11-23T10:31:15',
    entryNumber: 'ECR-2025-001235',
    debit: 3500.50,
    credit: 0,
    description: 'Liquidation - Virement bancaire BNP',
    agent: 'Système Blockchain',
    paymentId: '1'
  },
  {
    id: 'ae3',
    date: '2025-11-23T10:35:22',
    entryNumber: 'ECR-2025-001236',
    debit: 0,
    credit: 3500.50,
    description: 'Ordonnancement - Validation finale',
    agent: 'Contrôleur Financier',
    paymentId: '1'
  },
  // Payment 2 entries
  {
    id: 'ae4',
    date: '2025-11-23T14:15:00',
    entryNumber: 'ECR-2025-001237',
    debit: 0,
    credit: 4200.00,
    description: 'Engagement de dépense - Salaire Sophie Dubois',
    agent: 'Jean Dupont',
    paymentId: '2'
  },
  {
    id: 'ae5',
    date: '2025-11-23T14:16:30',
    entryNumber: 'ECR-2025-001238',
    debit: 4200.00,
    credit: 0,
    description: 'En attente de validation hiérarchique',
    agent: 'Système',
    paymentId: '2'
  },
  // Payment 4 entries
  {
    id: 'ae6',
    date: '2025-11-23T09:00:00',
    entryNumber: 'ECR-2025-001239',
    debit: 0,
    credit: 5100.00,
    description: 'Engagement de dépense - Salaire Nadia Karim',
    agent: 'Jean Dupont',
    paymentId: '4'
  },
  {
    id: 'ae7',
    date: '2025-11-23T09:01:45',
    entryNumber: 'ECR-2025-001240',
    debit: 5100.00,
    credit: 0,
    description: 'Liquidation - Virement bancaire La Banque Postale',
    agent: 'Système Blockchain',
    paymentId: '4'
  },
  {
    id: 'ae8',
    date: '2025-11-23T09:05:12',
    entryNumber: 'ECR-2025-001241',
    debit: 0,
    credit: 5100.00,
    description: 'Ordonnancement - Validation finale',
    agent: 'Contrôleur Financier',
    paymentId: '4'
  },
  // Payment 5 entries
  {
    id: 'ae9',
    date: '2025-11-23T11:20:00',
    entryNumber: 'ECR-2025-001242',
    debit: 0,
    credit: 3900.25,
    description: 'Engagement de dépense - Salaire Thomas Petit',
    agent: 'Jean Dupont',
    paymentId: '5'
  },
  {
    id: 'ae10',
    date: '2025-11-23T11:21:30',
    entryNumber: 'ECR-2025-001243',
    debit: 3900.25,
    credit: 0,
    description: 'En attente de validation hiérarchique',
    agent: 'Système',
    paymentId: '5'
  }
];

export const getEntriesByPaymentId = (paymentId: string): AccountingEntry[] => {
  return mockAccountingEntries.filter(entry => entry.paymentId === paymentId);
};

export const getTotalDebit = (entries: AccountingEntry[]): number => {
  return entries.reduce((sum, entry) => sum + entry.debit, 0);
};

export const getTotalCredit = (entries: AccountingEntry[]): number => {
  return entries.reduce((sum, entry) => sum + entry.credit, 0);
};

export const getBalance = (entries: AccountingEntry[]): number => {
  return getTotalDebit(entries) - getTotalCredit(entries);
};
