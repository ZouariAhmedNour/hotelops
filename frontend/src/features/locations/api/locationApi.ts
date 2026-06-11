import apiClient from "../../../shared/api/apiClient";

export type LocationType =
  | "ROOM"
  | "FLOOR"
  | "COMMON_AREA"
  | "SERVICE_AREA"
  | "OUTDOOR"
  | "PARKING"
  | "OTHER";

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
    isActive: boolean;
  }[];
  _count?: {
    tickets: number;
    qrCodes: number;
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