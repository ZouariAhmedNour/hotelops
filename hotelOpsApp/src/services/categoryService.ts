import api from "./api";
import type { CategoryItem } from "../features/tickets/types";

export const categoryService = {
  getAll: async (): Promise<CategoryItem[]> => {
    const response = await api.get("/categories");
    return response.data?.data ?? response.data ?? [];
  },

  getById: async (id: number): Promise<CategoryItem> => {
    const response = await api.get(`/categories/${id}`);
    return response.data?.data ?? response.data;
  },
};