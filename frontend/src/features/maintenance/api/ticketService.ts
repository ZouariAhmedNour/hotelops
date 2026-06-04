import type {
  ApiResponse,
  MaintenanceTicket,
  PaginatedResponse,
  TicketFilters,
} from "../../../types";
import api from "../../../shared/api/apiClient";

export const ticketService = {
  list: async (filters: TicketFilters = {}) => {
    const res = await api.get<
      ApiResponse<PaginatedResponse<MaintenanceTicket>>
    >("/tickets", {
      params: filters,
    });
    return res.data.data;
  },
  getById: async (id: number) => {
    const res = await api.get<ApiResponse<MaintenanceTicket>>(`/tickets/${id}`);
    return res.data.data;
  },
  create: async (data: Partial<MaintenanceTicket>) => {
    const res = await api.post<ApiResponse<MaintenanceTicket>>(
      "/tickets",
      data,
    );
    return res.data.data;
  },
  update: async (id: number, data: Partial<MaintenanceTicket>) => {
    const res = await api.put<ApiResponse<MaintenanceTicket>>(
      `/tickets/${id}`,
      data,
    );
    return res.data.data;
  },
  assign: async (id: number, assignedToUserId: number, note?: string) => {
    const res = await api.patch<ApiResponse<MaintenanceTicket>>(
      `/tickets/${id}/assign`,
      {
        assignedToUserId,
        note,
      },
    );
    return res.data.data;
  },
  changeStatus: async (id: number, statusCode: string) => {
    const res = await api.patch<ApiResponse<MaintenanceTicket>>(
      `/tickets/${id}/status`,
      {
        statusCode,
      },
    );
    return res.data.data;
  },
  uploadAttachment: async (ticketId: number, file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await api.post(`/tickets/${ticketId}/attachments`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data.data;
  },
};
