import { createContext, ReactNode, useContext, useMemo, useState } from "react";

import type { DetectionSubject as ScanSubject } from "@/services/plantDetection";

export type PendingScanCapture = {
  uri: string;
  base64: string;
  mimeType: string;
  subject: ScanSubject;
  source: "camera" | "gallery";
};

type PendingScanContextValue = {
  pendingScan: PendingScanCapture | null;
  setPendingScan: (capture: PendingScanCapture | null) => void;
  clearPendingScan: () => void;
};

const PendingScanContext = createContext<PendingScanContextValue | undefined>(
  undefined,
);

export function PendingScanProvider({ children }: { children: ReactNode }) {
  const [pendingScan, setPendingScan] = useState<PendingScanCapture | null>(null);

  const value = useMemo<PendingScanContextValue>(
    () => ({
      pendingScan,
      setPendingScan,
      clearPendingScan: () => setPendingScan(null),
    }),
    [pendingScan],
  );

  return (
    <PendingScanContext.Provider value={value}>
      {children}
    </PendingScanContext.Provider>
  );
}

export function usePendingScan() {
  const ctx = useContext(PendingScanContext);

  if (!ctx) {
    throw new Error("usePendingScan must be used inside a PendingScanProvider");
  }

  return ctx;
}
