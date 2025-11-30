import { Payment, PaymentHistory, Employee, DashboardStats } from '../types';

// Mock Payments Data
export const mockPayments: Payment[] = [
  {
    id: '1',
    chainId: 'tresor-channel',
    txId: '0x7f8a9b3c4d5e6f1234567890abcdef',
    blockNumber: '10453',
    blockHash: '0x8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e',
    matricule: 'MAT001234',
    fullName: 'Ahmed Ben Ali',
    bankInfo: 'BNP - IBAN: FR76 1234 5678 9012 3456 7890 123',
    montant: 3500.50,
    status: 'validated',
    submit: true,
    date: '2025-11-23T10:30:00',
    createdBy: 'Jean Dupont'
  },
  {
    id: '2',
    chainId: 'tresor-channel',
    txId: '0x3c4d5e6f7890abcdef1234567890abcd',
    blockNumber: '10454',
    blockHash: '0x2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c',
    matricule: 'MAT002345',
    fullName: 'Sophie Dubois',
    bankInfo: 'Société Générale - IBAN: FR76 9876 5432 1098 7654 3210 987',
    montant: 4200.00,
    status: 'pending',
    submit: false,
    date: '2025-11-23T14:15:00',
    createdBy: 'Jean Dupont'
  },
  {
    id: '3',
    chainId: 'tresor-channel',
    txId: '0x5e6f7890abcdef123456789012345678',
    blockNumber: '10455',
    blockHash: '0x4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e',
    matricule: 'MAT003456',
    fullName: 'Marc Laurent',
    bankInfo: 'Crédit Agricole - IBAN: FR76 5555 6666 7777 8888 9999 000',
    montant: 2800.75,
    status: 'failed',
    submit: true,
    date: '2025-11-22T16:45:00',
    createdBy: 'Marie Martin'
  },
  {
    id: '4',
    chainId: 'tresor-channel',
    txId: '0x90abcdef1234567890abcdef12345678',
    blockNumber: '10456',
    blockHash: '0x6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a',
    matricule: 'MAT004567',
    fullName: 'Nadia Karim',
    bankInfo: 'La Banque Postale - IBAN: FR76 1111 2222 3333 4444 5555 666',
    montant: 5100.00,
    status: 'validated',
    submit: true,
    date: '2025-11-23T09:00:00',
    createdBy: 'Jean Dupont'
  },
  {
    id: '5',
    chainId: 'tresor-channel',
    txId: '0xabcdef1234567890abcdef1234567890',
    blockNumber: '10457',
    blockHash: '0x8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c',
    matricule: 'MAT005678',
    fullName: 'Thomas Petit',
    bankInfo: 'CIC - IBAN: FR76 7777 8888 9999 0000 1111 222',
    montant: 3900.25,
    status: 'pending',
    submit: false,
    date: '2025-11-23T11:20:00',
    createdBy: 'Jean Dupont'
  }
];

// Mock Payment History
export const mockPaymentHistory: Record<string, PaymentHistory[]> = {
  '1': [
    {
      id: 'h1',
      paymentId: '1',
      action: 'Création du paiement',
      status: 'pending',
      timestamp: '2025-11-23T10:30:00',
      user: 'Jean Dupont',
      details: 'Paiement initialisé dans le système'
    },
    {
      id: 'h2',
      paymentId: '1',
      action: 'Enregistrement blockchain',
      status: 'pending',
      timestamp: '2025-11-23T10:31:15',
      user: 'Système',
      details: 'Transaction enregistrée sur Hyperledger Fabric'
    },
    {
      id: 'h3',
      paymentId: '1',
      action: 'Validation',
      status: 'validated',
      timestamp: '2025-11-23T10:35:22',
      user: 'Contrôleur Financier',
      details: 'Paiement validé et prêt pour traitement'
    }
  ],
  '2': [
    {
      id: 'h4',
      paymentId: '2',
      action: 'Création du paiement',
      status: 'pending',
      timestamp: '2025-11-23T14:15:00',
      user: 'Jean Dupont',
      details: 'Paiement initialisé dans le système'
    }
  ],
  '3': [
    {
      id: 'h5',
      paymentId: '3',
      action: 'Création du paiement',
      status: 'pending',
      timestamp: '2025-11-22T16:45:00',
      user: 'Marie Martin',
      details: 'Paiement initialisé dans le système'
    },
    {
      id: 'h6',
      paymentId: '3',
      action: 'Erreur de validation',
      status: 'failed',
      timestamp: '2025-11-22T16:50:33',
      user: 'Système',
      details: 'Échec de la validation - Informations bancaires invalides'
    }
  ]
};

// Mock Employees Data
export const mockEmployees: Employee[] = [
  {
    id: '1',
    matricule: 'MAT001234',
    fullName: 'Ahmed Ben Ali',
    fonction: 'Inspecteur des Finances',
    direction: 'Direction Générale du Trésor',
    email: 'ahmed.benali@tresor.gov',
    phone: '+33 1 23 45 67 89'
  },
  {
    id: '2',
    matricule: 'MAT002345',
    fullName: 'Sophie Dubois',
    fonction: 'Contrôleur Budgétaire',
    direction: 'Direction du Budget',
    email: 'sophie.dubois@tresor.gov',
    phone: '+33 1 23 45 67 90'
  },
  {
    id: '3',
    matricule: 'MAT003456',
    fullName: 'Marc Laurent',
    fonction: 'Gestionnaire de Paie',
    direction: 'Direction des Ressources Humaines',
    email: 'marc.laurent@tresor.gov',
    phone: '+33 1 23 45 67 91'
  },
  {
    id: '4',
    matricule: 'MAT004567',
    fullName: 'Nadia Karim',
    fonction: 'Auditeur Interne',
    direction: 'Direction de l\'Audit',
    email: 'nadia.karim@tresor.gov',
    phone: '+33 1 23 45 67 92'
  },
  {
    id: '5',
    matricule: 'MAT005678',
    fullName: 'Thomas Petit',
    fonction: 'Chef de Service Comptable',
    direction: 'Direction de la Comptabilité Publique',
    email: 'thomas.petit@tresor.gov',
    phone: '+33 1 23 45 67 93'
  },
  {
    id: '6',
    matricule: 'MAT006789',
    fullName: 'Fatima Mansouri',
    fonction: 'Analyste Financier',
    direction: 'Direction Générale du Trésor',
    email: 'fatima.mansouri@tresor.gov',
    phone: '+33 1 23 45 67 94'
  }
];

// Mock Dashboard Stats
export const getMockDashboardStats = (): DashboardStats => {
  const today = new Date().toISOString().split('T')[0];
  const paymentsToday = mockPayments.filter(p => 
    p.date.startsWith(today)
  ).length;
  
  const paymentsPending = mockPayments.filter(p => p.status === 'pending').length;
  const paymentsValidated = mockPayments.filter(p => p.status === 'validated').length;
  const paymentsFailed = mockPayments.filter(p => p.status === 'failed').length;
  
  const totalAmount = mockPayments
    .filter(p => p.status === 'validated')
    .reduce((sum, p) => sum + p.montant.toLocaleString('fr-FR'), 0);

  return {
    paymentsToday,
    paymentsPending,
    paymentsValidated,
    paymentsFailed,
    totalAmount
  };
};

// Mock data for charts
export const getPaymentsByDay = () => {
  return [
    { day: 'Lun', count: 12, amount: 42500 },
    { day: 'Mar', count: 15, amount: 53200 },
    { day: 'Mer', count: 8, amount: 28900 },
    { day: 'Jeu', count: 20, amount: 71800 },
    { day: 'Ven', count: 18, amount: 64500 },
    { day: 'Sam', count: 3, amount: 10200 },
    { day: 'Dim', count: 5, amount: 17500 }
  ];
};

export const getPaymentsByStatus = () => {
  return [
    { name: 'Validés', value: mockPayments.filter(p => p.status === 'validated').length, color: '#1A3C34' },
    { name: 'En attente', value: mockPayments.filter(p => p.status === 'pending').length, color: '#C5A557' },
    { name: 'Échoués', value: mockPayments.filter(p => p.status === 'failed').length, color: '#DC2626' }
  ];
};
