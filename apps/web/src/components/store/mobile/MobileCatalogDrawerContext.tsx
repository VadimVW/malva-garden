"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type MobileCatalogDrawerContextValue = {
  open: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
};

const MobileCatalogDrawerContext =
  createContext<MobileCatalogDrawerContextValue | null>(null);

export function MobileCatalogDrawerProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const openDrawer = useCallback(() => setOpen(true), []);
  const closeDrawer = useCallback(() => setOpen(false), []);
  const value = useMemo(
    () => ({ open, openDrawer, closeDrawer }),
    [open, openDrawer, closeDrawer],
  );
  return (
    <MobileCatalogDrawerContext.Provider value={value}>
      {children}
    </MobileCatalogDrawerContext.Provider>
  );
}

export function useMobileCatalogDrawer() {
  const ctx = useContext(MobileCatalogDrawerContext);
  if (!ctx) {
    throw new Error(
      "useMobileCatalogDrawer must be used within MobileCatalogDrawerProvider",
    );
  }
  return ctx;
}
