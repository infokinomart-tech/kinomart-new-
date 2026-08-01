import React, { createContext, useContext, useState, useEffect } from 'react';
import { Customer, SiteSettings } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  customer: Customer | null;
  customerPhone: string | null;
  loginCustomer: (phone: string, name: string, address?: string) => void;
  logoutCustomer: () => void;
  isAdminLoggedIn: boolean;
  loginAdmin: (token: string) => void;
  logoutAdmin: () => void;
  settings: SiteSettings | null;
  refreshSettings: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [customerPhone, setCustomerPhone] = useState<string | null>(() => {
    return localStorage.getItem('kinomart_customer_phone');
  });

  const [customerName, setCustomerName] = useState<string>(() => {
    return localStorage.getItem('kinomart_customer_name') || '';
  });

  const [customerAddress, setCustomerAddress] = useState<string>(() => {
    return localStorage.getItem('kinomart_customer_address') || '';
  });

  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(() => {
    return !!localStorage.getItem('kinomart_admin_token');
  });

  const [settings, setSettings] = useState<SiteSettings | null>(null);

  const fetchSettings = async () => {
    try {
      const data = await api.getSettings();
      setSettings(data);
    } catch (err) {
      console.error('Failed to load site settings', err);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  useEffect(() => {
    if (settings) {
      // Update document title
      if (settings.logo_title) {
        document.title = `${settings.logo_title}${settings.tagline ? ' | ' + settings.tagline : ''}`;
      }

      // Update favicon dynamically
      if (settings.favicon_url) {
        let link: HTMLLinkElement | null = document.querySelector("link[rel*='icon']");
        if (!link) {
          link = document.createElement('link');
          link.rel = 'icon';
          document.head.appendChild(link);
        }
        link.href = settings.favicon_url;
      }
    }
  }, [settings]);

  const loginCustomer = (phone: string, name: string, address?: string) => {
    setCustomerPhone(phone);
    setCustomerName(name);
    if (address) setCustomerAddress(address);

    localStorage.setItem('kinomart_customer_phone', phone);
    localStorage.setItem('kinomart_customer_name', name);
    if (address) localStorage.setItem('kinomart_customer_address', address);
  };

  const logoutCustomer = () => {
    setCustomerPhone(null);
    setCustomerName('');
    setCustomerAddress('');
    localStorage.removeItem('kinomart_customer_phone');
    localStorage.removeItem('kinomart_customer_name');
    localStorage.removeItem('kinomart_customer_address');
  };

  const loginAdmin = (token: string) => {
    localStorage.setItem('kinomart_admin_token', token);
    setIsAdminLoggedIn(true);
  };

  const logoutAdmin = () => {
    localStorage.removeItem('kinomart_admin_token');
    setIsAdminLoggedIn(false);
  };

  const customer: Customer | null = customerPhone
    ? {
        id: 'cust-' + customerPhone,
        phone: customerPhone,
        name: customerName || 'গ্রাহক',
        address: customerAddress,
        created_at: new Date().toISOString()
      }
    : null;

  return (
    <AuthContext.Provider
      value={{
        customer,
        customerPhone,
        loginCustomer,
        logoutCustomer,
        isAdminLoggedIn,
        loginAdmin,
        logoutAdmin,
        settings,
        refreshSettings: fetchSettings
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
