"use client";

import { createContext, useContext, type ReactNode } from "react";
import {
  STORE_HEADER_DEFAULTS,
  type StoreHeaderSettings,
} from "@/lib/storeHeaderSettings";

const StoreHeaderSettingsContext = createContext<StoreHeaderSettings | null>(
  null,
);

export function StoreHeaderSettingsProvider({
  value,
  children,
}: {
  value: StoreHeaderSettings;
  children: ReactNode;
}) {
  return (
    <StoreHeaderSettingsContext.Provider value={value}>
      {children}
    </StoreHeaderSettingsContext.Provider>
  );
}

export function useStoreHeaderSettings(): StoreHeaderSettings {
  const ctx = useContext(StoreHeaderSettingsContext);
  return ctx ?? STORE_HEADER_DEFAULTS;
}
