"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  customerFetch,
  customerLogin,
  customerLogout,
  customerRegister,
  type CustomerProfile,
} from "@/lib/customer-api";
import { getCustomerToken } from "@/lib/customer-auth";

type CustomerAuthContextValue = {
  customer: CustomerProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<CustomerProfile>;
  register: (input: {
    email: string;
    password: string;
    fullName?: string;
    phone?: string;
    acceptPrivacy: boolean;
  }) => Promise<{ customer: CustomerProfile; verificationUrl?: string }>;
  logout: () => void;
  refresh: () => Promise<void>;
};

const CustomerAuthContext = createContext<CustomerAuthContextValue | null>(null);

export function CustomerAuthProvider({ children }: { children: ReactNode }) {
  const [customer, setCustomer] = useState<CustomerProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    const token = getCustomerToken();
    if (!token) {
      setCustomer(null);
      return;
    }
    try {
      const me = await customerFetch<CustomerProfile>("/customer/me");
      setCustomer(me);
    } catch {
      customerLogout();
      setCustomer(null);
    }
  }, []);

  useEffect(() => {
    refresh().finally(() => setIsLoading(false));
  }, [refresh]);

  const value = useMemo<CustomerAuthContextValue>(
    () => ({
      customer,
      isLoading,
      isAuthenticated: Boolean(customer),
      login: async (email, password) => {
        const profile = await customerLogin(email, password);
        setCustomer(profile);
        return profile;
      },
      register: async (input) => {
        const data = await customerRegister(input);
        setCustomer(data.customer);
        return {
          customer: data.customer,
          verificationUrl: data.verificationUrl,
        };
      },
      logout: () => {
        customerLogout();
        setCustomer(null);
      },
      refresh,
    }),
    [customer, isLoading, refresh],
  );

  return (
    <CustomerAuthContext.Provider value={value}>
      {children}
    </CustomerAuthContext.Provider>
  );
}

export function useCustomerAuth() {
  const ctx = useContext(CustomerAuthContext);
  if (!ctx) {
    throw new Error("useCustomerAuth requires CustomerAuthProvider");
  }
  return ctx;
}
