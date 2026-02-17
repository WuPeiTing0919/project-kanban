"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { mockUsers, type User, type UserRole } from "./mock-data";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string, role: UserRole) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = "projecthub_auth_user";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore user from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as User;
        // Verify user still exists in mock data
        const found = mockUsers.find((u) => u.id === parsed.id);
        if (found) {
          setUser(found);
        } else {
          localStorage.removeItem(AUTH_STORAGE_KEY);
        }
      }
    } catch {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback((email: string, password: string, role: UserRole): boolean => {
    const found = mockUsers.find(
      (u) => u.email === email && u.password === password && u.role === role
    );
    if (found) {
      setUser(found);
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(found));
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
