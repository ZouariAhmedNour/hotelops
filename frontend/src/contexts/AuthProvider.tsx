import { useState } from "react";
import { AuthContext } from "./AuthContext";
import type { User } from "../types";
import { authService } from "../services/authService";

const getInitialAuth = () => {
  const token = localStorage.getItem("token");
  const user = localStorage.getItem("user");

  return {
    token,
    user: user ? JSON.parse(user) : null,
  };
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const initial = getInitialAuth();

  const [user, setUser] = useState<User | null>(initial.user);
  const [token, setToken] = useState<string | null>(initial.token);

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
        isAuthenticated: !!token,
        isLoading: false,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};