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

export interface MaintenanceTicketEvent {
  id: number;
  ticketId: number;
  userId?: number | null;
  type: string;
  fromStatusId?: number | null;
  toStatusId?: number | null;
  message?: string | null;
  metadata?: unknown;
  createdAt: string;
  user?: Pick<User, "id" | "firstName" | "lastName" | "email"> | null;
}

export interface MaintenanceComment {
  id: number;
  ticketId: number;
  userId: number;
  comment: string;
  isInternal: boolean;
  createdAt: string;
  user?: Pick<User, "id" | "firstName" | "lastName" | "email">;
}

export interface MaintenanceAttachment {
  id: number;
  ticketId: number;
  filePath: string;
  fileName: string;
  mimeType: string;
  fileSize: number;
  uploadedByUserId: number;
  photoType?: string | null;
  caption?: string | null;
  createdAt: string;
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
  assignedTo?: Pick<User, "id" | "firstName" | "lastName" | "email"> | null;

  urgencyLevel?: number;
  dueAt?: string | null;
  resolvedAt?: string | null;
  closedAt?: string | null;
  createdAt: string;
  updatedAt: string;

  comments?: MaintenanceComment[];
  attachments?: MaintenanceAttachment[];
  events?: MaintenanceTicketEvent[];

  _count?: {
    comments: number;
    attachments: number;
    events?: number;
    materials?: number;
  };
}

export interface TicketFilters {
  statusId?: number;
  priorityId?: number;
  assignedToUserId?: number;
  locationId?: number;
  categoryId?: number;

  statusCode?: string;
  priorityCode?: string;
  search?: string;

  unassignedOnly?: boolean;
  overdueOnly?: boolean;
  reportedFrom?: string;

  dateFrom?: string;
  dateTo?: string;

  sortBy?: string;
  sortOrder?: "asc" | "desc";

  page?: number;
  limit?: number;
}

export interface CreateTicketPayload {
  title: string;
  description: string;
  locationId: number;
  categoryId: number;
  priorityId: number;
  reportedFrom?: "web" | "mobile" | "reception";
  urgencyLevel?: number;
}

export interface TicketStatsOverview {
  total: number;
  new: number;
  assigned: number;
  inProgress: number;
  critical: number;
  overdue: number;
  resolvedToday: number;
  averageResolutionHours: number;
}

export interface KanbanColumn {
  id: number;
  name: string;
  code: string;
  color?: string | null;
  isFinal: boolean;
  tickets: MaintenanceTicket[];
}