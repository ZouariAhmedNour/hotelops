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

export interface LocationHistorySummary {
  totalInterventions: number;
  rootIncidents: number;
  followUpTickets: number;

  activeInterventions: number;
  inProgress: number;
  pending: number;
  partiallyResolved: number;
  resolved: number;
  closed: number;

  critical: number;
  overdue: number;

  repeatAssetCount: number;
  assetsMentionedCount: number;
  assetsNeverMentionedCount: number;

  totalTimeSpentMinutes: number;
  averageTimeSpentMinutes: number;
  averageResolutionHours: number;
}

export interface LocationHistoryBreakdown {
  id: number;
  name: string;
  count: number;
  percentage: number;

  code?: string;
  icon?: string | null;
  color?: string | null;
  isFinal?: boolean;
}

export interface LocationHistoryAsset {
  assetId: number;
  name: string;
  code: string;
  category?: string | null;
  icon?: string | null;

  ticketCount: number;
  incidentCount: number;
  isRepeated: boolean;

  openTicketCount: number;
  lastReportedAt?: string | null;
  topCategory?: string | null;
}

export interface LocationHistoryIntervention {
  id: number;
  ticketNumber: string;
  title: string;
  description: string;

  parentTicketId?: number | null;
  parentTicket?: {
    id: number;
    ticketNumber: string;
    title: string;
  } | null;

  reportedFrom?: string | null;
  urgencyLevel?: number | null;
  progress?: number | null;

  dueAt?: string | null;
  acceptedAt?: string | null;
  startedAt?: string | null;
  resolvedAt?: string | null;
  closedAt?: string | null;

  resolutionNote?: string | null;
  temporaryFixNote?: string | null;
  followUpReason?: string | null;
  recommendedSpecialty?: string | null;
  requiresExpertIntervention?: boolean;

  timeSpentMinutes?: number | null;

  createdAt: string;
  updatedAt: string;

  isFollowUp: boolean;
  isOverdue: boolean;

  category: {
    id: number;
    name: string;
    icon?: string | null;
  };

  priority: {
    id: number;
    name: string;
    code: string;
    sortOrder: number;
  };

  status: {
    id: number;
    name: string;
    code: string;
    color?: string | null;
    isFinal: boolean;
  };

  assignedTo?: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  } | null;

  ticketAssets: {
    id: number;
    assetId: number;
    asset: {
      id: number;
      name: string;
      code: string;
      category?: string | null;
      icon?: string | null;
    };
  }[];
}

export interface LocationHistoryResponse {
  location: HotelLocation;
  summary: LocationHistorySummary;

  categoryBreakdown: LocationHistoryBreakdown[];
  priorityBreakdown: LocationHistoryBreakdown[];
  statusBreakdown: LocationHistoryBreakdown[];

  assetHistory: LocationHistoryAsset[];

  monthlyTrend: {
    key: string;
    label: string;
    count: number;
    resolvedCount: number;
  }[];

  interventions: LocationHistoryIntervention[];
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

   async getHistory(id: number) {
    const response = await apiClient.get(`/locations/${id}/history`);

    return response.data.data as LocationHistoryResponse;
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