import api from "./api";
import type { LocationItem } from "../features/tickets/types";

export const locationService = {
  getAll: async (): Promise<LocationItem[]> => {
    const response = await api.get("/locations");

    return response.data?.data ?? response.data ?? [];
  },

  getById: async (id: number): Promise<LocationItem> => {
    const response = await api.get(`/locations/${id}`);

    return response.data?.data ?? response.data;
  },
};