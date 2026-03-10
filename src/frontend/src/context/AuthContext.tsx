import { createContext, useContext, useState } from "react";

export type Role = "admin" | "guest";

export type Credentials = Record<string, { password: string; role: Role }>;

interface AuthContextValue {
  role: Role | null;
  credentials: Credentials;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  updateCredentials: (
    type: "admin" | "guest",
    newUsername: string,
    newPassword: string,
  ) => void;
}

const DEFAULT_CREDENTIALS: Credentials = {
  admin: { password: "admin123", role: "admin" },
  guest: { password: "guest123", role: "guest" },
};

function loadCredentials(): Credentials {
  try {
    const stored = localStorage.getItem("app_credentials");
    if (stored) return JSON.parse(stored) as Credentials;
  } catch {
    // ignore
  }
  return DEFAULT_CREDENTIALS;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<Role | null>(null);
  const [credentials, setCredentials] = useState<Credentials>(loadCredentials);

  const login = (username: string, password: string): boolean => {
    const cred = credentials[username.toLowerCase()];
    if (cred && cred.password === password) {
      setRole(cred.role);
      return true;
    }
    return false;
  };

  const logout = () => setRole(null);

  const updateCredentials = (
    type: "admin" | "guest",
    newUsername: string,
    newPassword: string,
  ) => {
    const updated: Credentials = {};
    // Remove old entry for this role and add new one
    for (const [k, v] of Object.entries(credentials)) {
      if (v.role !== type) updated[k] = v;
    }
    updated[newUsername.toLowerCase()] = { password: newPassword, role: type };
    localStorage.setItem("app_credentials", JSON.stringify(updated));
    setCredentials(updated);
  };

  return (
    <AuthContext.Provider
      value={{ role, credentials, login, logout, updateCredentials }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
