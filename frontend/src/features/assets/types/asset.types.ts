export interface MaintenanceAsset {
  id: number;
  name: string;
  code: string;

  category?: string | null;
  icon?: string | null;
  description?: string | null;

  isActive: boolean;

  createdAt: string;
  updatedAt: string;

  _count?: {
    locationAssets: number;
    ticketAssets: number;
  };
}

export interface AssetPayload {
  name: string;
  code: string;

  category?: string;
  icon?: string;
  description?: string;

  isActive?: boolean;
}

export interface AssetListParams {
  search?: string;
  isActive?: boolean;
}