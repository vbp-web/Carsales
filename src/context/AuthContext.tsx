import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, Address } from '../types/index.ts';
import { api } from '../services/api.ts';
import { useToast } from './ToastContext.tsx';

interface AuthContextValue {
  user: User | null;
  token: string | null;
  loading: boolean;
  addresses: Address[];
  login: (credentials: { email: string; password: string }) => Promise<void>;
  register: (userData: { name: string; email: string; phone?: string; password: string }) => Promise<void>;
  logout: () => void;
  quickLoginDemo: (role: 'CUSTOMER' | 'ADMIN') => Promise<void>;
  refreshUser: () => Promise<void>;
  createAddress: (addr: Omit<Address, 'id' | 'userId'>) => Promise<Address>;
  updateAddress: (id: string, updates: Partial<Address>) => Promise<Address>;
  deleteAddress: (id: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('autoapex_token'));
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const { success, error } = useToast();

  const refreshUser = useCallback(async () => {
    const curToken = localStorage.getItem('autoapex_token');
    if (!curToken) {
      setUser(null);
      setAddresses([]);
      setLoading(false);
      return;
    }

    try {
      const data = await api.auth.me();
      setUser(data.user);
      setAddresses(data.addresses || []);
    } catch (err) {
      console.warn('Session expired or invalid token:', err);
      localStorage.removeItem('autoapex_token');
      setToken(null);
      setUser(null);
      setAddresses([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = async (credentials: { email: string; password: string }) => {
    try {
      const res = await api.auth.login(credentials);
      localStorage.setItem('autoapex_token', res.token);
      setToken(res.token);
      setUser(res.user);
      await refreshUser();
      success('Logged In', `Welcome back, ${res.user.name}!`);
    } catch (err: any) {
      error('Login Failed', err.message || 'Invalid credentials.');
      throw err;
    }
  };

  const register = async (userData: { name: string; email: string; phone?: string; password: string }) => {
    try {
      const res = await api.auth.register(userData);
      localStorage.setItem('autoapex_token', res.token);
      setToken(res.token);
      setUser(res.user);
      await refreshUser();
      success('Account Created', 'Welcome to AutoApex!');
    } catch (err: any) {
      error('Registration Failed', err.message);
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem('autoapex_token');
    setToken(null);
    setUser(null);
    setAddresses([]);
    success('Logged Out', 'You have been signed out successfully.');
  };

  const quickLoginDemo = async (role: 'CUSTOMER' | 'ADMIN') => {
    const email = role === 'ADMIN' ? 'admin@example.com' : 'customer@example.com';
    const password = role === 'ADMIN' ? 'Admin123!' : 'Customer123!';
    await login({ email, password });
  };

  const createAddress = async (addr: Omit<Address, 'id' | 'userId'>) => {
    const created = await api.addresses.create(addr);
    await refreshUser();
    success('Address Saved', 'New shipping address added.');
    return created;
  };

  const updateAddress = async (id: string, updates: Partial<Address>) => {
    const updated = await api.addresses.update(id, updates);
    await refreshUser();
    success('Address Updated', 'Shipping address modified.');
    return updated;
  };

  const deleteAddress = async (id: string) => {
    await api.addresses.delete(id);
    await refreshUser();
    success('Address Removed', 'Shipping address deleted.');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        addresses,
        login,
        register,
        logout,
        quickLoginDemo,
        refreshUser,
        createAddress,
        updateAddress,
        deleteAddress
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
