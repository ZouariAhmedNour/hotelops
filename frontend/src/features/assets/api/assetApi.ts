import apiClient from "../../../shared/api/apiClient";

import type {
  AssetListParams,
  AssetPayload,
  MaintenanceAsset,
} from "../types/asset.types";

export const assetApi = {
  async getAll(params?: AssetListParams) {
    const response = await apiClient.get("/assets", {
      params,
    });

    return response.data.data as MaintenanceAsset[];
  },

  async getById(id: number) {
    const response = await apiClient.get(`/assets/${id}`);

    return response.data.data as MaintenanceAsset;
  },

  async create(payload: AssetPayload) {
    const response = await apiClient.post("/assets", payload);

    return response.data.data as MaintenanceAsset;
  },

  async update(id: number, payload: Partial<AssetPayload>) {
    const response = await apiClient.put(`/assets/${id}`, payload);

    return response.data.data as MaintenanceAsset;
  },

  async remove(id: number) {
    const response = await apiClient.delete(`/assets/${id}`);

    return response.data.data as MaintenanceAsset;
  },
};