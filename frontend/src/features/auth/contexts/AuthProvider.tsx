import { useState, type ReactNode } from "react";
import { AuthContext } from "./AuthContext";
import type { User } from "../../../shared/types/auth.types";
import { authService } from "../api/auth.service";

interface AuthProviderProps {
  children: ReactNode;
}

const getInitialUser = (): User | null => {
  const storedUser = localStorage.getItem("user");

  if (!storedUser) return null;

  try {
    return JSON.parse(storedUser) as User;
  } catch {
    localStorage.removeItem("user");
    return null;
  }
};

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("token")
  );

  const [user, setUser] = useState<User | null>(getInitialUser());

  const login = (newToken: string, newUser: User) => {
    localStorage.setItem("token", newToken);
    localStorage.setItem("user", JSON.stringify(newUser));

    setToken(newToken);
    setUser(newUser);
  };

  const logout = () => {
    authService.logout();

    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: Boolean(token),
        isLoading: false,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};