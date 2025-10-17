import React, { createContext, ReactNode, useContext } from "react";
import { useAuth } from "../hooks/useAuth";

interface AuthContextType {
  isAuthenticated: boolean;
  user: any;
  accessToken: string | null;
  refreshToken: string | null;
  username: string | null;
  isLoading: boolean;
  login: (
    username: string,
    password: string
  ) => Promise<{ success: boolean; message: string }>;
  logout: () => Promise<void>;
  signup: (userData: {
    username: string;
    name: string;
    password: string;
    nickname: string;
  }) => Promise<{ success: boolean; message: string }>;
  refreshAccessToken: () => Promise<{ success: boolean; accessToken?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const auth = useAuth();

  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
};

export const useAuthContext = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
};
