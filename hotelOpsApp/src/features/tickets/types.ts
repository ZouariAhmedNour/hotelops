import type * as ImagePicker from "expo-image-picker";

export type LocationType =
  | "ROOM"
  | "FLOOR"
  | "COMMON_AREA"
  | "SERVICE_AREA"
  | "OUTDOOR"
  | "PARKING"
  | "OTHER"
  | string;

export type AssetItem = {
  id: number;
  name: string;
  code: string;
  category?: string | null;
  icon?: string | null;
  description?: string | null;
  isActive?: boolean;
};

export type LocationAssetItem = {
  id: number;
  locationId: number;
  assetId: number;
  quantity?: number;
  label?: string | null;
  notes?: string | null;
  isActive?: boolean;
  asset: AssetItem;
};

export type SelectableAssetItem = AssetItem & {
  locationAssetId?: number;
  quantity?: number;
  label?: string | null;
};

export type LocationItem = {
  id: number;
  name: string;
  code: string;
  type: LocationType;
  zone?: string | null;
  floor?: string | null;
  roomNumber?: string | null;
  description?: string | null;
  isActive?: boolean;

  locationAssets?: LocationAssetItem[];

  _count?: {
    tickets?: number;
    qrCodes?: number;
    locationAssets?: number;
  };
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

  reportedFrom?: string;
  urgencyLevel?: number;

  assetIds?: number[];

  files?: ImagePicker.ImagePickerAsset[];
};