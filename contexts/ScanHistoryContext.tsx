import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, ReactNode, useContext, useEffect, useState } from "react";

import type { ScanSubject, TreatmentStep } from "@/services/scanAnalysis";

export type ScanSeverity = "needs attention" | "healthy" | "monitor";

export type ScanStage = "Early" | "Moderate" | "Advanced" | "Healthy";

export type ScanRecord = {
  id: string;
  diseaseId: string;
  diseaseName: string;
  scientificName: string;
  summary: string;
  description: string;
  severity: ScanSeverity;
  stageLabel: ScanStage;
  confidence: number;
  imageUri: string;
  subject: ScanSubject;
  source: "camera" | "gallery";
  treatmentSteps: TreatmentStep[];
  recommendation: string;
  warning: string;
  isCocoaLeaf: boolean;
  modelLabel: string;
  scannedAt: Date;
};

type StoredScanRecord = Omit<ScanRecord, "scannedAt"> & {
  scannedAt: string;
};

type ScanHistoryContextValue = {
  scans: ScanRecord[];
  isHydrated: boolean;
  /** Call this from the analysis screen once the backend finishes. */
  addScan: (scan: Omit<ScanRecord, "id" | "scannedAt">) => ScanRecord;
  /** Deletes one scan from history. */
  deleteScan: (id: string) => void;
  /** Wipes all scan history — used by the Settings screen. */
  clearScans: () => void;
};

const ScanHistoryContext = createContext<ScanHistoryContextValue | undefined>(
  undefined,
);

const STORAGE_KEY = "cocoaguard.scan-history.v1";

function toStoredScan(scan: ScanRecord): StoredScanRecord {
  return {
    ...scan,
    scannedAt: scan.scannedAt.toISOString(),
  };
}

function fromStoredScan(scan: StoredScanRecord): ScanRecord {
  return {
    ...scan,
    scannedAt: new Date(scan.scannedAt),
  };
}

async function persistScans(scans: ScanRecord[]) {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(scans.map(toStoredScan)));
}

export function ScanHistoryProvider({ children }: { children: ReactNode }) {
  const [scans, setScans] = useState<ScanRecord[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    let mounted = true;

    const loadScans = async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (!mounted) return;

        if (stored) {
          const parsed = JSON.parse(stored) as StoredScanRecord[];
          setScans(parsed.map(fromStoredScan));
        }
      } catch {
        // If storage is unreadable, start from a clean slate.
        if (mounted) {
          setScans([]);
        }
      } finally {
        if (mounted) {
          setIsHydrated(true);
        }
      }
    };

    void loadScans();

    return () => {
      mounted = false;
    };
  }, []);

  const addScan: ScanHistoryContextValue["addScan"] = (scan) => {
    const newScan: ScanRecord = {
      ...scan,
      id: `${Date.now()}`,
      scannedAt: new Date(),
    };

    setScans((prev) => {
      const next = [newScan, ...prev];
      void persistScans(next);
      return next;
    });

    return newScan;
  };

  const deleteScan: ScanHistoryContextValue["deleteScan"] = (id) => {
    setScans((prev) => {
      const next = prev.filter((scan) => scan.id !== id);
      void persistScans(next);
      return next;
    });
  };

  const clearScans = () => {
    setScans([]);
    void AsyncStorage.removeItem(STORAGE_KEY);
  };

  return (
    <ScanHistoryContext.Provider
      value={{ scans, isHydrated, addScan, deleteScan, clearScans }}
    >
      {children}
    </ScanHistoryContext.Provider>
  );
}

export function useScanHistory() {
  const ctx = useContext(ScanHistoryContext);
  if (!ctx) {
    throw new Error("useScanHistory must be used inside a ScanHistoryProvider");
  }
  return ctx;
}
