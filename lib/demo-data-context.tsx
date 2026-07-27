"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import { resetDemoData as resetMockDemoData } from "@/lib/mock/mockData";

const STORAGE_KEY = "helm-demo-mode";

interface DemoDataContextValue {
  demoModeEnabled: boolean;
  setDemoModeEnabled: (value: boolean) => void;
  resetVersion: number;
  resetDemoData: () => void;
}

const DemoDataContext = createContext<DemoDataContextValue | null>(null);

export function useDemoData(): DemoDataContextValue {
  const value = useContext(DemoDataContext);
  if (!value)
    throw new Error("useDemoData must be used within DemoDataProvider");
  return value;
}

export function DemoDataProvider({ children }: { children: ReactNode }) {
  const [resetVersion, setResetVersion] = useState(0);
  const [demoModeEnabled, setDemoModeEnabledState] = useState(false);

  useEffect(() => {
    try {
      setDemoModeEnabledState(localStorage.getItem(STORAGE_KEY) === "true");
    } catch {
      /* ignore */
    }
  }, []);

  const setDemoModeEnabled = useCallback((value: boolean) => {
    setDemoModeEnabledState(value);
    try {
      if (value) {
        localStorage.setItem(STORAGE_KEY, "true");
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch {
      /* ignore */
    }
  }, []);

  const resetDemoData = useCallback(() => {
    resetMockDemoData();
    setResetVersion((v) => v + 1);
  }, []);

  return (
    <DemoDataContext.Provider
      value={{
        demoModeEnabled,
        setDemoModeEnabled,
        resetVersion,
        resetDemoData,
      }}
    >
      {children}
    </DemoDataContext.Provider>
  );
}
