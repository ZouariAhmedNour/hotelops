import type * as ImagePicker from "expo-image-picker";

export type LocationItem = {
  id: number;
  name: string;
  code: string;
  type: "ROOM" | "FLOOR" | "COMMON_AREA" | "SERVICE_AREA" | "OUTDOOR" | "PARKING" | "OTHER" | string;
  zone?: string | null;
  floor?: string | null;
  roomNumber?: string | null;
  description?: string | null;
  isActive?: boolean;
};

export type PriorityCode = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";

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
  files?: ImagePicker.ImagePickerAsset[];
};