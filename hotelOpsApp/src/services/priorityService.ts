import api from "./api";
import type { PriorityItem } from "../features/tickets/types";

export const priorityService = {
  getAll: async (): Promise<PriorityItem[]> => {
    const response = await api.get("/priorities");
    return response.data?.data ?? response.data ?? [];
  },

  getById: async (id: number): Promise<PriorityItem> => {
    const response = await api.get(`/priorities/${id}`);
    return response.data?.data ?? response.data;
  },
};