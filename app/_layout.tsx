import { AuthProvider } from "@/contexts/AuthContext";
import { PendingScanProvider } from "@/contexts/PendingScanContext";
import { ScanHistoryProvider } from "@/contexts/ScanHistoryContext";
import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <AuthProvider>
      <PendingScanProvider>
        <ScanHistoryProvider>
          <Stack screenOptions={{ headerShown: false }} />
        </ScanHistoryProvider>
      </PendingScanProvider>
    </AuthProvider>
  );
}
