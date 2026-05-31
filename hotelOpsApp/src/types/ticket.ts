export type MaintenanceTicket = {
  id: number;
  title: string;
  description: string;
  status: string;
  locationId: number;
  categoryId: number;
  priorityId: number;
  createdAt: string;
  updatedAt: string;
};