import apiClient from "../../../shared/api/apiClient";
import type { ApiResponse } from "../../../shared/types/api.types";
import type { User } from "../../../shared/types/auth.types";

export const userService = {
  list: async (): Promise<User[]> => {
    const res = await apiClient.get<ApiResponse<User[]>>("/users");
    return res.data.data;
  },

  getById: async (id: number): Promise<User> => {
    const res = await apiClient.get<ApiResponse<User>>(`/users/${id}`);
    return res.data.data;
  },
};