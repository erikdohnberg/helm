"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";
import { resetDemoData as resetMockDemoData } from "@/lib/mock/mockData";

interface DemoDataContextValue {
  resetVersion: number;
  resetDemoData: () => void;
}

const DemoDataContext = createContext<DemoDataContextValue | null>(null);

export function useDemoData(): DemoDataContextValue {
  const value = useContext(DemoDataContext);
  if (!value) throw new Error("useDemoData must be used within DemoDataProvider");
  return value;
}

export function DemoDataProvider({ children }: { children: ReactNode }) {
  const [resetVersion, setResetVersion] = useState(0);

  const resetDemoData = useCallback(() => {
    resetMockDemoData();
    setResetVersion((v) => v + 1);
  }, []);

  return (
    <DemoDataContext.Provider value={{ resetVersion, resetDemoData }}>
      {children}
    </DemoDataContext.Provider>
  );
}
