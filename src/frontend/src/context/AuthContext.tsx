import { createContext, useContext, useState } from "react";

export type Role = "admin" | "guest";

interface AuthContextValue {
  role: Role | null;
  login: (username: string, password: string) => boolean;
  logout: () => void;
}

const CREDENTIALS: Record<string, { password: string; role: Role }> = {
  admin: { password: "admin123", role: "admin" },
  guest: { password: "guest123", role: "guest" },
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<Role | null>(null);

  const login = (username: string, password: string): boolean => {
    const cred = CREDENTIALS[username.toLowerCase()];
    if (cred && cred.password === password) {
      setRole(cred.role);
      return true;
    }
    return false;
  };

  const logout = () => setRole(null);

  return (
    <AuthContext.Provider value={{ role, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
