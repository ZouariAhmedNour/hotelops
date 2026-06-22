import apiClient from "../../../shared/api/apiClient";

import type { MaintenanceAsset } from "../../assets/types/asset.types";

export type LocationType =
  | "ROOM"
  | "FLOOR"
  | "COMMON_AREA"
  | "SERVICE_AREA"
  | "OUTDOOR"
  | "PARKING"
  | "OTHER";

export interface LocationAsset {
  id: number;
  locationId: number;
  assetId: number;

  quantity: number;
  label?: string | null;
  notes?: string | null;
  isActive: boolean;

  createdAt: string;
  updatedAt: string;

  asset: MaintenanceAsset;
}

export interface LocationAssetPayload {
  assetId: number;
  quantity?: number;
  label?: string;
  notes?: string;
  isActive?: boolean;
}

export interface HotelLocation {
  id: number;
  name: string;
  code: string;
  type: LocationType;

  zone?: string | null;
  floor?: string | null;
  roomNumber?: string | null;
  description?: string | null;

  isActive: boolean;

  createdAt: string;
  updatedAt: string;

  qrCodes?: {
    id: number;
    token?: string;
    label?: string | null;
    isActive: boolean;
    scanCount?: number;
    createdAt?: string;
  }[];

  locationAssets?: LocationAsset[];

  _count?: {
    tickets: number;
    qrCodes: number;
    locationAssets: number;
  };
}

export interface LocationPayload {
  name: string;
  code: string;
  type: LocationType;

  zone?: string;
  floor?: string;
  roomNumber?: string;
  description?: string;

  isActive?: boolean;

  assets?: LocationAssetPayload[];
}

export const locationApi = {
  async getAll() {
    const response = await apiClient.get("/locations");

    return response.data.data as HotelLocation[];
  },

  async getById(id: number) {
    const response = await apiClient.get(`/locations/${id}`);

    return response.data.data as HotelLocation;
  },

  async create(payload: LocationPayload) {
    const response = await apiClient.post("/locations", payload);

    return response.data.data as HotelLocation;
  },

  async update(id: number, payload: Partial<LocationPayload>) {
    const response = await apiClient.put(`/locations/${id}`, payload);

    return response.data.data as HotelLocation;
  },

  async remove(id: number) {
    const response = await apiClient.delete(`/locations/${id}`);

    return response.data.data;
  },
};