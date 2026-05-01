import type { ApiResponse, User } from "../types";
import api from "./api";

export interface LoginPayload {
  email: string;
  password: string;
}
export interface LoginResponse {
  token: string;
  user: User;
}
export const authService = {
  login: async (payload: LoginPayload): Promise<LoginResponse> => {
    const res = await api.post<ApiResponse<LoginResponse>>(
      "/auth/login",
      payload,
    );
    return res.data.data;
  },
  getMe: async (): Promise<User> => {
    const res = await api.get<ApiResponse<User>>("/auth/me");
    return res.data.data;
  },
  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  },
};
