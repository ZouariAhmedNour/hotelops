import api from "../../../services/api";
import type { MaintenanceTicket } from "../../../types/ticket";

export type AgentTaskListResponse = {
  tasks: MaintenanceTicket[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export type ResolveTaskPayload = {
  resolutionNote: string;
  timeSpentMinutes?: number;
  materialsUsed?: {
    name: string;
    quantity: number;
    unit?: string;
  }[];
};

export type PartialResolveTaskPayload = {
  temporaryFixNote: string;
  followUpTitle?: string;
  followUpDescription: string;

  followUpPriorityId?: number;
  followUpCategoryId?: number;

  requiresExpertIntervention?: boolean;
  expertReason: string;
  recommendedSpecialty?: string;

  timeSpentMinutes?: number;

  materialsUsed?: {
    name: string;
    quantity: number;
    unit?: string;
  }[];
};

export type PartialResolveTaskResponse = {
  originalTicket: MaintenanceTicket;
  followUpTicket: MaintenanceTicket;
};

export const agentMobileService = {
  getMe: async () => {
    const response = await api.get("/agent/me");
    return response.data?.data ?? response.data;
  },

  getTodayStats: async () => {
    const response = await api.get("/agent/stats/today");
    return response.data?.data ?? response.data;
  },

  getTasks: async (
    params: Record<string, string | number | undefined> = {}
  ): Promise<AgentTaskListResponse> => {
    const response = await api.get("/agent/tasks", {
      params,
    });

    return response.data?.data ?? response.data;
  },

  getTaskById: async (id: number): Promise<MaintenanceTicket> => {
    const response = await api.get(`/agent/tasks/${id}`);
    return response.data?.data ?? response.data;
  },

  acceptTask: async (id: number): Promise<MaintenanceTicket> => {
    const response = await api.patch(`/agent/tasks/${id}/accept`);
    return response.data?.data ?? response.data;
  },

  startTask: async (id: number): Promise<MaintenanceTicket> => {
    const response = await api.patch(`/agent/tasks/${id}/start`);
    return response.data?.data ?? response.data;
  },

  pauseTask: async (
    id: number,
    reason?: string
  ): Promise<MaintenanceTicket> => {
    const response = await api.patch(`/agent/tasks/${id}/pause`, {
      reason,
    });

    return response.data?.data ?? response.data;
  },

  pendingParts: async (
    id: number,
    reason?: string
  ): Promise<MaintenanceTicket> => {
    const response = await api.patch(`/agent/tasks/${id}/pending-parts`, {
      reason,
    });

    return response.data?.data ?? response.data;
  },

  needHelp: async (
    id: number,
    reason?: string
  ): Promise<MaintenanceTicket> => {
    const response = await api.patch(`/agent/tasks/${id}/need-help`, {
      reason,
    });

    return response.data?.data ?? response.data;
  },

  updateProgress: async (
    id: number,
    progress: number,
    note?: string
  ): Promise<MaintenanceTicket> => {
    const response = await api.patch(`/agent/tasks/${id}/progress`, {
      progress,
      note,
    });

    return response.data?.data ?? response.data;
  },

  resolveTask: async (
    id: number,
    data: ResolveTaskPayload
  ): Promise<MaintenanceTicket> => {
    const response = await api.patch(`/agent/tasks/${id}/resolve`, data);

    return response.data?.data ?? response.data;
  },

  partialResolveTask: async (
    id: number,
    data: PartialResolveTaskPayload
  ): Promise<PartialResolveTaskResponse> => {
    const response = await api.patch(
      `/agent/tasks/${id}/partial-resolve`,
      data
    );

    return response.data?.data ?? response.data;
  },

  addNote: async (
    id: number,
    comment: string,
    isInternal = true
  ) => {
    const response = await api.post(`/agent/tasks/${id}/notes`, {
      comment,
      isInternal,
    });

    return response.data?.data ?? response.data;
  },

  uploadPhoto: async (
    id: number,
    file: {
      uri: string;
      name: string;
      type: string;
    },
    photoType = "AFTER"
  ) => {
    const formData = new FormData();

    formData.append("file", file as any);
    formData.append("photoType", photoType);

    const response = await api.post(`/agent/tasks/${id}/photos`, formData, {
      headers: {
        Accept: "application/json",
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data?.data ?? response.data;
  },

  updateAvailability: async (availabilityStatus: string) => {
    const response = await api.patch("/agent/availability", {
      availabilityStatus,
    });

    return response.data?.data ?? response.data;
  },
};