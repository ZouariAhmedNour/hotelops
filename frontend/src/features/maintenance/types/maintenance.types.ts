import type { User } from "../../../shared/types/auth.types";

export interface Location {
  id: number;
  name: string;
  type: string;
  parentId?: number;
  code?: string;
  zone?: string | null;
  floor?: string | null;
  roomNumber?: string | null;
  description?: string | null;
  isActive: boolean;
  children?: Location[];
}

export interface MaintenanceCategory {
  id: number;
  name: string;
  icon?: string | null;
  isActive: boolean;
}

export interface MaintenancePriority {
  id: number;
  name: string;
  code: string;
  sortOrder: number;
  slaHours?: number | null;
}

export interface MaintenanceStatus {
  id: number;
  name: string;
  code: string;
  color?: string | null;
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
  uploadedByUserId?: number | null;
  photoType?: string | null;
  caption?: string | null;
  createdAt: string;

  uploadedBy?: Pick<User, "id" | "firstName" | "lastName" | "email"> | null;
}

export interface MaintenanceMaterial {
  id: number;
  ticketId: number;
  name: string;
  quantity: number;
  unit?: string | null;
  createdAt: string;
}

export interface MaintenanceTicketAsset {
  id: number;
  ticketId?: number;
  assetId: number;
  createdAt?: string;

  asset: {
    id: number;
    name: string;
    code: string;
    category?: string | null;
    icon?: string | null;
    description?: string | null;
  };
}

export interface LinkedTicket {
  id: number;
  ticketNumber: string;
  title: string;

  parentTicketId?: number | null;
  reportedFrom?: string | null;
  progress?: number;

  temporaryFixNote?: string | null;
  followUpReason?: string | null;
  recommendedSpecialty?: string | null;
  requiresExpertIntervention?: boolean;

  createdAt: string;

  location?: Pick<
    Location,
    "id" | "name" | "code" | "zone" | "floor" | "roomNumber"
  >;

  category?: Pick<MaintenanceCategory, "id" | "name" | "icon">;

  priority?: Pick<
    MaintenancePriority,
    "id" | "name" | "code" | "sortOrder"
  >;

  status?: Pick<
    MaintenanceStatus,
    "id" | "name" | "code" | "color" | "isFinal"
  >;
}

export interface MaintenanceTicket {
  id: number;
  ticketNumber: string;
  title: string;
  description: string;

  locationId?: number;
  categoryId?: number;
  priorityId?: number;
  statusId?: number;

  parentTicketId?: number | null;

  reportedFrom?: string | null;
  urgencyLevel?: number | null;
  progress?: number;

  dueAt?: string | null;
  acceptedAt?: string | null;
  startedAt?: string | null;
  pausedAt?: string | null;
  resolvedAt?: string | null;
  validatedAt?: string | null;
  closedAt?: string | null;

  resolutionNote?: string | null;
  closureNote?: string | null;
  pendingReason?: string | null;
  needHelpReason?: string | null;

  temporaryFixNote?: string | null;
  followUpReason?: string | null;
  recommendedSpecialty?: string | null;
  requiresExpertIntervention?: boolean;
  followUpCreatedAt?: string | null;

  timeSpentMinutes?: number | null;

  createdAt: string;
  updatedAt: string;

  location: Location;
  category: MaintenanceCategory;
  priority: MaintenancePriority;
  status: MaintenanceStatus;

  reportedBy?: Pick<User, "id" | "firstName" | "lastName" | "email"> | null;

  assignedTo?: Pick<User, "id" | "firstName" | "lastName" | "email"> | null;

  validatedBy?: Pick<User, "id" | "firstName" | "lastName" | "email"> | null;

  parentTicket?: LinkedTicket | null;
  followUpTickets?: LinkedTicket[];

  comments?: MaintenanceComment[];
  attachments?: MaintenanceAttachment[];
  events?: MaintenanceTicketEvent[];
  materials?: MaintenanceMaterial[];
  ticketAssets?: MaintenanceTicketAsset[];

  _count?: {
    comments: number;
    attachments: number;
    events?: number;
    materials?: number;
    ticketAssets?: number;
    followUpTickets?: number;
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

  reportedFrom?: "web" | "mobile" | "reception" | "agent_follow_up";

  urgencyLevel?: number;
  assetIds?: number[];
  files?: File[];
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
  partiallyResolved?: number;
}

export interface KanbanColumn {
  id: number;
  name: string;
  code: string;
  color?: string | null;
  isFinal: boolean;
  tickets: MaintenanceTicket[];
}