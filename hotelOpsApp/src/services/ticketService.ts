import api from "./api";
import * as ImagePicker from "expo-image-picker";
import type { MaintenanceTicket } from "../types/ticket";

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
  name: string;
  type: string;
};

export const ticketService = {
  createTicket: async (data: CreateTicketPayload) => {
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
      data.files.forEach((file) => {
        formData.append("files", {
          uri: file.uri,
          name: file.fileName || `ticket-${Date.now()}.jpg`,
          type: file.mimeType || "image/jpeg",
        } as any);
      });
    }

    const response = await api.post("/tickets", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data?.data ?? response.data;
  },

  getById: async (id: number): Promise<MaintenanceTicket> => {
    const response = await api.get(`/tickets/${id}`);
    return response.data?.data ?? response.data;
  },

  uploadAttachment: async (ticketId: number, file: UploadFile) => {
    const formData = new FormData();

    formData.append("file", file as any);

    const response = await api.post(
      `/tickets/${ticketId}/attachments`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return response.data?.data ?? response.data;
  },
};