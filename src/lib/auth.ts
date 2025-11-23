import { User } from '../types';

const STORAGE_KEY = 'tresor_user';

// Mock users for authentication
const mockUsers = [
  {
    id: '1',
    fullName: 'Jean Dupont',
    password: 'password123',
    role: 'TMSP' as const,
    email: 'jean.dupont@tresor.gov'
  },
  {
    id: '2',
    fullName: 'Marie Martin',
    password: 'password123',
    role: 'TrRegionMSP' as const,
    email: 'marie.martin@tresor.gov'
  },
  {
    id: '3',
    fullName: 'Pierre Durand',
    password: 'password123',
    role: 'CpeMSP' as const,
    email: 'pierre.durand@tresor.gov'
  }
];

export const login = (fullName: string, password: string): User | null => {
  const user = mockUsers.find(
    u => u.fullName === fullName && u.password === password
  );

  if (user) {
    const { password: _, ...userWithoutPassword } = user;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(userWithoutPassword));
    return userWithoutPassword;
  }

  return null;
};

export const logout = () => {
  localStorage.removeItem(STORAGE_KEY);
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
