import api from "../../../services/api";
import * as ImagePicker from "expo-image-picker";
import type { MaintenanceTicket } from "../../../types/ticket";

export type CreateTicketPayload = {
  title: string;
  description: string;
  locationId: number;
  categoryId: number;
  priorityId: number;
  reportedFrom?: string;
  urgencyLevel?: number;
  files?: ImagePicker.ImagePickerAsset[];
};

type UploadFile = {
  uri: string;
  name?: string;
  type?: string;
};

const getAssetFileName = (
  asset: ImagePicker.ImagePickerAsset,
  index: number
) => {
  if (asset.fileName) return asset.fileName;

  const extension = asset.uri.split(".").pop()?.split("?")[0] || "jpg";

  return `ticket-photo-${Date.now()}-${index}.${extension}`;
};

const getAssetMimeType = (asset: ImagePicker.ImagePickerAsset) => {
  if (asset.mimeType) return asset.mimeType;

  const uri = asset.uri.toLowerCase();

  if (uri.endsWith(".png")) return "image/png";
  if (uri.endsWith(".webp")) return "image/webp";
  if (uri.endsWith(".heic")) return "image/heic";

  return "image/jpeg";
};

export const ticketService = {
  createTicket: async (
    data: CreateTicketPayload
  ): Promise<MaintenanceTicket> => {
    const formData = new FormData();

    formData.append("title", data.title);
    formData.append("description", data.description);
    formData.append("locationId", String(data.locationId));
    formData.append("categoryId", String(data.categoryId));
    formData.append("priorityId", String(data.priorityId));

    if (data.reportedFrom) {
      formData.append("reportedFrom", data.reportedFrom);
    }

    if (data.urgencyLevel !== undefined) {
      formData.append("urgencyLevel", String(data.urgencyLevel));
    }

    if (data.files && data.files.length > 0) {
      data.files.forEach((file, index) => {
        formData.append("files", {
          uri: file.uri,
          name: getAssetFileName(file, index),
          type: getAssetMimeType(file),
        } as any);
      });
    }

    const response = await api.post("/tickets", formData, {
      headers: {
        Accept: "application/json",
      },
    });

    return response.data?.data ?? response.data;
  },

  getById: async (id: number): Promise<MaintenanceTicket> => {
    const response = await api.get(`/tickets/${id}`);
    return response.data?.data ?? response.data;
  },

  uploadAttachment: async (
    ticketId: number,
    file: UploadFile,
    photoType = "AFTER",
    caption?: string
  ) => {
    const formData = new FormData();

    formData.append("file", {
      uri: file.uri,
      name: file.name || `attachment-${Date.now()}.jpg`,
      type: file.type || "image/jpeg",
    } as any);

    formData.append("photoType", photoType);

    if (caption) {
      formData.append("caption", caption);
    }

    const response = await api.post(
      `/tickets/${ticketId}/attachments`,
      formData,
      {
        headers: {
          Accept: "application/json",
        },
      }
    );

    return response.data?.data ?? response.data;
  },
};