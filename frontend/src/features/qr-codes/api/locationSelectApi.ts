import apiClient from "../../../shared/api/apiClient";

export interface LocationOption {
  id: number;
  name: string;
  type: string;
  code?: string;
  parentId?: number;
  isActive: boolean;
}

export const locationSelectApi = {
  async getAll() {
    const response = await apiClient.get("/locations");
    return response.data.data as LocationOption[];
  },
};