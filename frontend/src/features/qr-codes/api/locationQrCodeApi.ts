import apiClient from "../../../shared/api/apiClient";

export interface LocationQrCode {
  id: number;
  locationId: number;
  token: string;
  label?: string;
  url: string;
  isActive: boolean;
  scanCount: number;
  lastScannedAt?: string;
  createdAt: string;
  updatedAt: string;
  qrImageDataUrl?: string;
  alreadyExists?: boolean;
  location: {
    id: number;
    name: string;
    type: string;
    code?: string;
    parent?: {
      id: number;
      name: string;
      type: string;
    } | null;
  };
  _count?: {
    tickets: number;
  };
}
//

export const locationQrCodeApi = {
  async getAll() {
    const response = await apiClient.get("/location-qr-codes");
    return response.data.data as LocationQrCode[];
  },

  async getById(id: number) {
    const response = await apiClient.get(`/location-qr-codes/${id}`);
    return response.data.data as LocationQrCode;
  },

  async create(payload: { locationId: number; label?: string }) {
    const response = await apiClient.post("/location-qr-codes", payload);
    return response.data.data as LocationQrCode;
  },

  async regenerate(id: number) {
    const response = await apiClient.patch(`/location-qr-codes/${id}/regenerate`);
    return response.data.data as LocationQrCode;
  },

  async toggleStatus(id: number) {
    const response = await apiClient.patch(`/location-qr-codes/${id}/toggle-status`);
    return response.data.data as LocationQrCode;
  },
};