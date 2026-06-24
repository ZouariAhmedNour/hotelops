export type TicketStatus = {
  id?: number;
  name?: string;
  code?: string;
  color?: string | null;
  isFinal?: boolean;
};

export type TicketPriority = {
  id?: number;
  name?: string;
  code?: string;
  sortOrder?: number;
  slaHours?: number | null;
};

export type TicketCategory = {
  id?: number;
  name?: string;
  icon?: string | null;
};

export type TicketLocation = {
  id?: number;
  name?: string;
  code?: string;
  type?: string;
  zone?: string | null;
  floor?: string | null;
  roomNumber?: string | null;
};

export type TicketUser = {
  id?: number;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string | null;
};

export type TicketAttachment = {
  id: number;
  filePath: string;
  fileName: string;
  mimeType?: string | null;
  fileSize?: number;
  photoType?: string | null;
  caption?: string | null;
  createdAt?: string;
  uploadedBy?: TicketUser | null;
};

export type TicketMaterial = {
  id: number;
  name: string;
  quantity: number;
  unit?: string | null;
  createdAt?: string;
};

export type TicketEvent = {
  id: number;
  type: string;
  message?: string | null;
  metadata?: unknown;
  createdAt?: string;
  user?: TicketUser | null;
};

export type TicketAsset = {
  id: number;
  assetId: number;
  createdAt?: string;
  asset?: {
    id: number;
    name: string;
    code: string;
    category?: string | null;
    icon?: string | null;
  };
};

export type LinkedTicket = {
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
  createdAt?: string;

  status?: TicketStatus | null;
  priority?: TicketPriority | null;
  category?: TicketCategory | null;
  location?: TicketLocation | null;
};

export type MaintenanceTicket = {
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

  createdAt?: string;
  updatedAt?: string;

  location?: TicketLocation | null;
  category?: TicketCategory | null;
  priority?: TicketPriority | null;
  status?: TicketStatus | null;

  reportedBy?: TicketUser | null;
  assignedTo?: TicketUser | null;
  validatedBy?: TicketUser | null;

  parentTicket?: LinkedTicket | null;
  followUpTickets?: LinkedTicket[];

  attachments?: TicketAttachment[];
  materials?: TicketMaterial[];
  events?: TicketEvent[];
  ticketAssets?: TicketAsset[];

  comments?: Array<{
    id: number;
    comment: string;
    isInternal?: boolean;
    createdAt?: string;
    user?: TicketUser | null;
  }>;

  _count?: {
    comments?: number;
    attachments?: number;
    events?: number;
    materials?: number;
    ticketAssets?: number;
    followUpTickets?: number;
  };
};