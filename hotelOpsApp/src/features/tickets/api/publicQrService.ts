import * as ImagePicker from "expo-image-picker";
import api from "../../../services/api";

export type PublicQrInfo = {
  token: string;
  label?: string | null;
  location: {
    id: number;
    name: string;
    code: string;
    type: string;
    zone?: string | null;
    floor?: string | null;
    roomNumber?: string | null;
    description?: string | null;
    isActive?: boolean;
  };
};

export type CreatePublicTicketPayload = {
  token: string;
  description: string;
  categoryId: number;
  priorityId: number;

  reporterType: "CLIENT" | "STAFF" | "VISITOR" | "OTHER" | "ANONYMOUS";

  fullName?: string;
  phone?: string;
  email?: string;
  roomNumber?: string;
  reservationCode?: string;

  files?: ImagePicker.ImagePickerAsset[];
};

const getAssetFileName = (
  asset: ImagePicker.ImagePickerAsset,
  index: number
) => {
  if (asset.fileName) return asset.fileName;

  const extension = asset.uri.split(".").pop()?.split("?")[0] || "jpg";

  return `public-ticket-photo-${Date.now()}-${index}.${extension}`;
};

const getAssetMimeType = (asset: ImagePicker.ImagePickerAsset) => {
  if (asset.mimeType) return asset.mimeType;

  const uri = asset.uri.toLowerCase();

  if (uri.endsWith(".png")) return "image/png";
  if (uri.endsWith(".webp")) return "image/webp";
  if (uri.endsWith(".heic")) return "image/heic";

  return "image/jpeg";
};

export const publicQrService = {
  getQrInfo: async (token: string): Promise<PublicQrInfo> => {
    const response = await api.get(`/public/qr/${token}`);
    return response.data?.data ?? response.data;
  },

  createTicket: async (payload: CreatePublicTicketPayload) => {
    const formData = new FormData();

    formData.append("token", payload.token);
    formData.append("description", payload.description);
    formData.append("categoryId", String(payload.categoryId));
    formData.append("priorityId", String(payload.priorityId));
    formData.append("reporterType", payload.reporterType);

    if (payload.fullName) {
      formData.append("fullName", payload.fullName);
    }

    if (payload.phone) {
      formData.append("phone", payload.phone);
    }

    if (payload.email) {
      formData.append("email", payload.email);
    }

    if (payload.roomNumber) {
      formData.append("roomNumber", payload.roomNumber);
    }

    if (payload.reservationCode) {
      formData.append("reservationCode", payload.reservationCode);
    }

    if (payload.files && payload.files.length > 0) {
      payload.files.forEach((file, index) => {
        formData.append("files", {
          uri: file.uri,
          name: getAssetFileName(file, index),
          type: getAssetMimeType(file),
        } as any);
      });
    }

    const response = await api.post("/public/tickets", formData, {
      headers: {
        Accept: "application/json",
      },
    });

    return response.data?.data ?? response.data;
  },

  getCategories: async () => {
    const response = await api.get("/public/categories");
    return response.data?.data ?? response.data;
  },

  getPriorities: async () => {
    const response = await api.get("/public/priorities");
    return response.data?.data ?? response.data;
  },
};