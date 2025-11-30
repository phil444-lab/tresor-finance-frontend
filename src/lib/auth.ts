import { User, UserRole } from '../types';
import { authApi, apiClient } from './api';

const STORAGE_KEY = 'tresor_user';

export const login = async (fullName: string, password: string): Promise<User | null> => {
  try {
    const response = await authApi.login({ fullName, password });
    
    if (response.success) {
      // Stocker les tokens
      apiClient.setToken(response.data.token);
      apiClient.setRefreshToken(response.data.refreshToken);
      
      // Stocker les informations utilisateur
      const user: User = {
        id: response.data.user.id,
        fullName: response.data.user.fullName,
        role: response.data.user.role as UserRole,
      };
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
      return user;
    }
    
    return null;
  } catch (error) {
    console.error('Login error:', error);
    return null;
  }
};

export const logout = async () => {
  try {
    // Appeler l'API de logout pour invalider le token côté serveur
    await authApi.logout();
  } catch (error) {
    console.error('Logout API error:', error);
    // Continuer même si l'API échoue
  } finally {
    // Nettoyer le stockage local
    localStorage.removeItem(STORAGE_KEY);
    apiClient.setToken(null);
    apiClient.setRefreshToken(null);
  }
};

export const getCurrentUser = (): User | null => {
  const userStr = localStorage.getItem(STORAGE_KEY);
  if (userStr) {
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }
  return null;
};

export const isAuthenticated = (): boolean => {
  return getCurrentUser() !== null;
};
