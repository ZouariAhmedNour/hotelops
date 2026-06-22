import * as ImagePicker from "expo-image-picker";

import api from "../../../services/api";
import type { MaintenanceTicket } from "../../../types/ticket";
import type { CreateTicketPayload } from "../types";

export type { CreateTicketPayload } from "../types";

type UploadFile = {
  uri: string;
  name?: string;
  type?: string;
};

const getAssetFileName = (
  asset: ImagePicker.ImagePickerAsset,
  index: number
) => {
  if (asset.fileName) {
    return asset.fileName;
  }

  const extension = asset.uri.split(".").pop()?.split("?")[0] || "jpg";

  return `ticket-photo-${Date.now()}-${index}.${extension}`;
};

const getAssetMimeType = (asset: ImagePicker.ImagePickerAsset) => {
  if (asset.mimeType) {
    return asset.mimeType;
  }

  const uri = asset.uri.toLowerCase();

  if (uri.endsWith(".png")) return "image/png";
  if (uri.endsWith(".webp")) return "image/webp";
  if (uri.endsWith(".heic")) return "image/heic";

  return "image/jpeg";
};

const getUniqueAssetIds = (assetIds?: number[]) => {
  return [...new Set((assetIds ?? []).filter(Number.isInteger))];
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

    const assetIds = getUniqueAssetIds(data.assetIds);

    if (assetIds.length > 0) {
      formData.append("assetIds", JSON.stringify(assetIds));
    }

    if (data.files && data.files.length > 0) {
      data.files.forEach((file, index) => {
        formData.append(
          "files",
          {
            uri: file.uri,
            name: getAssetFileName(file, index),
            type: getAssetMimeType(file),
          } as unknown as Blob
        );
      });
    }

    const response = await api.post("/tickets", formData, {
      headers: {
        Accept: "application/json",
        "Content-Type": "multipart/form-data",
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

    formData.append(
      "file",
      {
        uri: file.uri,
        name: file.name || `attachment-${Date.now()}.jpg`,
        type: file.type || "image/jpeg",
      } as unknown as Blob
    );

    formData.append("photoType", photoType);

    if (caption?.trim()) {
      formData.append("caption", caption.trim());
    }

    const response = await api.post(
      `/tickets/${ticketId}/attachments`,
      formData,
      {
        headers: {
          Accept: "application/json",
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return response.data?.data ?? response.data;
  },
};