export interface Role {
  id: number;
  name: string;
  code: string;
  description?: string;
}
export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  isActive: boolean;
  createdAt: string;
  role: Role;
}

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
  _count?: { comments: number; attachments: number };
}
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
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
