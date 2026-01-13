// Configuration de l'API
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
import { AccountingEntry } from '../types';

export interface PendingPayment {
  id: string;
  chainId: string;
  matricule: string;
  fullName: string;
  montant: number;
  aggregationStatus: string;
  createdAt: string;
  user: {
    id: string;
    fullName: string;
    role: string;
  };
  aggregator?: {
    id: string;
    fullName: string;
    role: string;
  };
}

// Types pour les réponses API
export interface LoginRequest {
  fullName: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    token: string;
    refreshToken: string;
    user: {
      id: string;
      fullName: string;
      role: string;
    };
  };
}

export interface ApiError {
  success: false;
  message: string;
}

// Configuration Axios-like fetch wrapper
class ApiClient {
  private baseURL: string;
  private token: string | null = null;
  private refreshToken: string | null = null;
  private refreshPromise: Promise<string> | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    this.token = localStorage.getItem('tresor_token');
    this.refreshToken = localStorage.getItem('tresor_refresh_token');
  }

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('tresor_token', token);
    } else {
      localStorage.removeItem('tresor_token');
    }
  }

  setRefreshToken(refreshToken: string | null) {
    this.refreshToken = refreshToken;
    if (refreshToken) {
      localStorage.setItem('tresor_refresh_token', refreshToken);
    } else {
      localStorage.removeItem('tresor_refresh_token');
    }
  }

  private async refreshAccessToken(): Promise<string> {
    if (!this.refreshToken) {
      throw new Error('No refresh token available');
    }

    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    this.refreshPromise = (async () => {
      try {
        const response = await fetch(`${this.baseURL}/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken: this.refreshToken })
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error('Refresh token expired');
        }

        this.setToken(data.data.token);
        return data.data.token;
      } finally {
        this.refreshPromise = null;
      }
    })();

    return this.refreshPromise;
  }

  // Méthode générique pour les requêtes
  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    // Ajouter le token d'authentification si disponible
    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    const config: RequestInit = {
      ...options,
      headers,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (response.status === 401 && this.refreshToken && !endpoint.includes('/auth/')) {
        try {
          const newToken = await this.refreshAccessToken();
          headers.Authorization = `Bearer ${newToken}`;
          const retryResponse = await fetch(url, { ...config, headers });
          return await retryResponse.json();
        } catch (refreshError) {
          this.setToken(null);
          this.setRefreshToken(null);
          window.location.href = '/login';
          throw new Error('Session expirée');
        }
      }

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('API Request failed:', error);
      throw error;
    }
  }

  // Méthodes HTTP
  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

// Instance globale du client API
export const apiClient = new ApiClient(API_BASE_URL);

// Services d'authentification
export const authApi = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    return apiClient.post<LoginResponse>('/auth/login', credentials);
  },

  logout: async (): Promise<{ success: boolean; message: string }> => {
    return apiClient.post('/auth/logout');
  },

  getProfile: async () => {
    return apiClient.get('/auth/profile');
  },
};

// Services pour les employés
export const employeesApi = {
  getAll: async () => {
    return apiClient.get('/employees');
  },

  getById: async (id: string) => {
    return apiClient.get(`/employees/${id}`);
  },

  getByMatricule: async (matricule: string) => {
    return apiClient.get(`/employees/matricule/${matricule}`);
  },

  search: async (query: string) => {
    return apiClient.get(`/employees/search?query=${encodeURIComponent(query)}`);
  },

  create: async (employee: any) => {
    return apiClient.post('/employees', employee);
  },

  update: async (id: string, employee: any) => {
    return apiClient.put(`/employees/${id}`, employee);
  },

  delete: async (id: string) => {
    return apiClient.delete(`/employees/${id}`);
  },
};

// Services pour les paiements
export const paymentsApi = {
  getAll: async (): Promise<{ success: boolean; data: any[] }> => {
    return apiClient.get('/payments');
  },

  getById: async (id: string): Promise<{ success: boolean; data: any }> => {
    return apiClient.get(`/payments/${id}`);
  },

  getByMatricule: async (matricule: string): Promise<{ success: boolean; data: any[] }> => {
    return apiClient.get(`/payments/matricule/${matricule}`);
  },

  create: async (payment: any): Promise<{ message: string; payment: any }> => {
    return apiClient.post('/payments', payment);
  },

  delete: async (id: string): Promise<{ message: string }> => {
    return apiClient.delete(`/payments/${id}`);
  },

  getHistory: async (id: string): Promise<any[]> => {
    return apiClient.get(`/payments/${id}/history`);
  },

  getFromBlockchain: async (chainId: string): Promise<{ success: boolean; data: any }> => {
    return apiClient.get(`/payments/blockchain/${chainId}`);
  },

  getAccountingEntries: async (): Promise<{ success: boolean; data: AccountingEntry[] }> => {
    return apiClient.get('/payments/accounting-entries');
  },
};

// Services pour les recettes
export const revenuesApi = {
  getAll: async (): Promise<{ success: boolean; data: any[] }> => {
    return apiClient.get('/revenues');
  },

  getById: async (id: string): Promise<{ success: boolean; data: any }> => {
    return apiClient.get(`/revenues/${id}`);
  },

  getByTaxpayerNumber: async (taxpayerNumber: string): Promise<{ success: boolean; data: any[] }> => {
    return apiClient.get(`/revenues/taxpayer/${taxpayerNumber}`);
  },

  create: async (revenue: any): Promise<{ message: string; revenue: any }> => {
    return apiClient.post('/revenues', revenue);
  },

  getHistory: async (id: string): Promise<any[]> => {
    return apiClient.get(`/revenues/${id}/history`);
  },

  getAccountingEntries: async (): Promise<{ success: boolean; data: AccountingEntry[] }> => {
    return apiClient.get('/revenues/accounting-entries');
  },
};

// Services pour l'agrégation (Trésoriers Régionaux)
export const aggregationApi = {
  getPendingPayments: async (): Promise<{ success: boolean; data: any[] }> => {
    return apiClient.get('/aggregation/pending');
  },

  approvePayment: async (paymentId: string, action: 'approved' | 'rejected' | 'cpe_approved' | 'cpe_rejected'): Promise<{ success: boolean; message: string; txId: string }> => {
    return apiClient.put(`/aggregation/payment/${paymentId}/aggregate`, { action });
  },

  getSupervisedTreasurers: async (): Promise<{ success: boolean; data: any[] }> => {
    return apiClient.get('/aggregation/supervised');
  },

  getPendingRevenues: async (): Promise<{ success: boolean; data: any[] }> => {
    return apiClient.get('/aggregation/revenues/pending');
  },

  approveRevenue: async (revenueId: string, action: 'approved' | 'rejected'): Promise<{ success: boolean; message: string; txId: string }> => {
    return apiClient.put(`/aggregation/revenue/${revenueId}/aggregate`, { action });
  },
};

// Services pour les utilisateurs
export const usersApi = {
  getById: async (id: string): Promise<{ success: boolean; data: any }> => {
    return apiClient.get(`/users/${id}`);
  },
};

// Services pour les CPE
export const cpeApi = {
  getPendingPayments: async (): Promise<{ success: boolean; data: any[] }> => {
    return apiClient.get('/aggregation/cpe/pending');
  },

  validatePayment: async (paymentId: string, action: 'cpe_approved' | 'cpe_rejected'): Promise<{ success: boolean; message: string }> => {
    return apiClient.put(`/aggregation/cpe/payment/${paymentId}/validate`, { action });
  },

  getSupervisedRegionalTreasurers: async (): Promise<{ success: boolean; data: any[] }> => {
    return apiClient.get('/aggregation/cpe/supervised');
  },

  getPendingRevenues: async (): Promise<{ success: boolean; data: any[] }> => {
    return apiClient.get('/aggregation/cpe/revenues/pending');
  },

  validateRevenue: async (revenueId: string, action: 'cpe_approved' | 'cpe_rejected'): Promise<{ success: boolean; message: string }> => {
    return apiClient.put(`/aggregation/cpe/revenue/${revenueId}/validate`, { action });
  },
};
