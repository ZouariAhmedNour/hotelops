import type { User } from "../../../shared/types/auth.types";

export interface Location {
  id: number;
  name: string;
  type: string;
  parentId?: number;
  code?: string;
  isActive: boolean;
  children?: Location[];
}

export interface MaintenanceCategory {
  id: number;
  name: string;
  description?: string;
  icon?: string;
  isActive: boolean;
}

export interface MaintenancePriority {
  id: number;
  name: string;
  code: string;
  sortOrder: number;
  slaHours?: number;
}

export interface MaintenanceStatus {
  id: number;
  name: string;
  code: string;
  color?: string;
  isFinal: boolean;
}

export interface MaintenanceTicket {
  id: number;
  ticketNumber: string;
  title: string;
  description: string;

  location: Location;
  category: MaintenanceCategory;
  priority: MaintenancePriority;
  status: MaintenanceStatus;

  reportedBy: Pick<User, "id" | "firstName" | "lastName" | "email">;
  assignedTo?: Pick<User, "id" | "firstName" | "lastName" | "email">;

  urgencyLevel?: number;
  dueAt?: string;
  resolvedAt?: string;
  closedAt?: string;

  createdAt: string;
  updatedAt: string;

  _count?: {
    comments: number;
    attachments: number;
  };
}

export interface TicketFilters {
  statusId?: number;
  priorityId?: number;
  assignedToUserId?: number;
  locationId?: number;
  categoryId?: number;
  search?: string;
  page?: number;
  limit?: number;
}

export interface CreateTicketPayload {
  title: string;
  description: string;
  locationId: number;
  categoryId: number;
  priorityId: number;
  reportedFrom?: "web" | "mobile";
  urgencyLevel?: number;
}