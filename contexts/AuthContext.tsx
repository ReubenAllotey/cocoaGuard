import { createContext, useContext, useState, ReactNode } from "react";

export type AuthUser = {
  name: string;
  email: string;
};

type AuthContextValue = {
  user: AuthUser | null;
  isSignedIn: boolean;
  /** Mock sign-in for now — no real backend, just sets local state. */
  signIn: (email: string, password: string) => void;
  signOut: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function deriveNameFromEmail(email: string): string {
  const localPart = email.split("@")[0] ?? "Farmer";
  return localPart
    .replace(/[._-]+/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);

  const signIn = (email: string, _password: string) => {
    // No real backend yet — accept any non-empty email/password and
    // fabricate a display name from the email's local part.
    setUser({ name: deriveNameFromEmail(email), email });
  };

  const signOut = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, isSignedIn: !!user, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside an AuthProvider");
  }
  return ctx;
}
