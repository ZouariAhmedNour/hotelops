import type * as ImagePicker from "expo-image-picker";

export type LocationItem = {
  id: number;
  name: string;
  type: string;
};

export type PriorityCode = "critical" | "high" | "medium" | "low";

export type PriorityItem = {
  id: number;
  name: string;
  code: PriorityCode | string;
  sortOrder: number;
  slaHours?: number | null;
};

export type CategoryItem = {
  id: number;
  name: string;
  description?: string | null;
  icon?: string | null;
  isActive?: boolean;
};

export type CreateTicketPayload = {
  title: string;
  description: string;
  locationId: number;
  categoryId: number;
  priorityId: number;
  reportedFrom: "mobile";
  urgencyLevel: number;
  files: ImagePicker.ImagePickerAsset[];
};