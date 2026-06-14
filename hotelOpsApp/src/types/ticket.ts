export type MaintenanceStatus = {
  id: number;
  name: string;
  code: string;
  color?: string | null;
  isFinal?: boolean;
};

export type MaintenancePriority = {
  id: number;
  name: string;
  code: string;
  sortOrder?: number;
  slaHours?: number | null;
};

export type MaintenanceCategory = {
  id: number;
  name: string;
  icon?: string | null;
  isActive?: boolean;
};

export type Location = {
  id: number;
  name: string;
  code: string;
  type: string;
  zone?: string | null;
  floor?: string | null;
  roomNumber?: string | null;
  description?: string | null;
  isActive?: boolean;
};

export type UserLite = {
  id: number;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string | null;
};

export type MaintenanceAttachment = {
  id: number;
  ticketId: number;
  filePath: string;
  fileName: string;
  mimeType: string;
  fileSize: number;
  photoType?: string | null;
  caption?: string | null;
  createdAt: string;
  url?: string;
};

export type MaintenanceComment = {
  id: number;
  ticketId: number;
  userId: number;
  comment: string;
  isInternal: boolean;
  createdAt: string;
  user?: UserLite;
};

export type MaintenanceTicketEvent = {
  id: number;
  ticketId: number;
  userId?: number | null;
  type: string;
  message?: string | null;
  createdAt: string;
  user?: UserLite | null;
};

export type InterventionMaterial = {
  id: number;
  ticketId: number;
  name: string;
  quantity: number;
  unit?: string | null;
  createdAt: string;
};

export type MaintenanceTicket = {
  id: number;
  ticketNumber: string;
  title: string;
  description: string;

  locationId: number;
  categoryId: number;
  priorityId: number;
  statusId: number;
  reportedByUserId: number;
  assignedToUserId?: number | null;

  reportedFrom?: string | null;
  urgencyLevel?: number | null;
  progress?: number;

  dueAt?: string | null;
  acceptedAt?: string | null;
  startedAt?: string | null;
  pausedAt?: string | null;
  resolvedAt?: string | null;
  closedAt?: string | null;

  resolutionNote?: string | null;
  pendingReason?: string | null;
  needHelpReason?: string | null;
  timeSpentMinutes?: number | null;

  createdAt: string;
  updatedAt: string;

  location: Location;
  category: MaintenanceCategory;
  priority: MaintenancePriority;
  status: MaintenanceStatus;
  reportedBy?: UserLite;
  assignedTo?: UserLite | null;

  comments?: MaintenanceComment[];
  attachments?: MaintenanceAttachment[];
  events?: MaintenanceTicketEvent[];
  materials?: InterventionMaterial[];
};