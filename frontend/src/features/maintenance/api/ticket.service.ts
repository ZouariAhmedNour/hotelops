import apiClient from "../../../shared/api/apiClient";
import type {
  ApiResponse,
  PaginatedResponse,
} from "../../../shared/types/api.types";
import type {
  CreateTicketPayload,
  KanbanColumn,
  MaintenanceTicket,
  TicketFilters,
  TicketStatsOverview,
} from "../types/maintenance.types";

export const ticketService = {
  list: async (
    filters: TicketFilters = {}
  ): Promise<PaginatedResponse<MaintenanceTicket>> => {
    const res = await apiClient.get<
      ApiResponse<PaginatedResponse<MaintenanceTicket>>
    >("/tickets", {
      params: filters,
    });

    return res.data.data;
  },

  getById: async (id: number): Promise<MaintenanceTicket> => {
    const res = await apiClient.get<ApiResponse<MaintenanceTicket>>(
      `/tickets/${id}`
    );

    return res.data.data;
  },

  create: async (data: CreateTicketPayload): Promise<MaintenanceTicket> => {
    const res = await apiClient.post<ApiResponse<MaintenanceTicket>>(
      "/tickets",
      data
    );

    return res.data.data;
  },

  update: async (
    id: number,
    data: Partial<CreateTicketPayload>
  ): Promise<MaintenanceTicket> => {
    const res = await apiClient.put<ApiResponse<MaintenanceTicket>>(
      `/tickets/${id}`,
      data
    );

    return res.data.data;
  },

  assign: async (
    id: number,
    assignedToUserId: number,
    note?: string
  ): Promise<MaintenanceTicket> => {
    const res = await apiClient.post<ApiResponse<MaintenanceTicket>>(
      `/tickets/${id}/assign`,
      {
        assignedToUserId,
        note,
      }
    );

    return res.data.data;
  },

  changeStatus: async (
    id: number,
    statusCode: string,
    message?: string
  ): Promise<MaintenanceTicket> => {
    const res = await apiClient.patch<ApiResponse<MaintenanceTicket>>(
      `/tickets/${id}/status`,
      {
        statusCode,
        message,
      }
    );

    return res.data.data;
  },

  uploadAttachment: async (
    ticketId: number,
    file: File,
    photoType?: string,
    caption?: string
  ) => {
    const formData = new FormData();

    formData.append("file", file);

    if (photoType) {
      formData.append("photoType", photoType);
    }

    if (caption) {
      formData.append("caption", caption);
    }

    const res = await apiClient.post<ApiResponse<unknown>>(
      `/tickets/${ticketId}/attachments`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return res.data.data;
  },

  statsOverview: async (): Promise<TicketStatsOverview> => {
    const res = await apiClient.get<ApiResponse<TicketStatsOverview>>(
      "/tickets/stats/overview"
    );

    return res.data.data;
  },

  kanban: async (): Promise<KanbanColumn[]> => {
    const res = await apiClient.get<ApiResponse<KanbanColumn[]>>(
      "/tickets/kanban"
    );

    return res.data.data;
  },
};