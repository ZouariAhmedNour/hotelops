import * as ImagePicker from "expo-image-picker";

import api from "../../../services/api";
import type {
  AssetItem,
  CategoryItem,
  LocationAssetItem,
  PriorityItem,
} from "../types";

export type PublicQrInfo = {
  token: string;
  label?: string | null;

  location: {
    id: number;
    name: string;
    code: string;
    type: string;
    zone?: string | null;
    floor?: string | null;
    roomNumber?: string | null;
    description?: string | null;
    isActive?: boolean;
    assets: AssetItem[];
  };
};

type RawPublicQrInfo = Omit<PublicQrInfo, "location"> & {
  location: Omit<PublicQrInfo["location"], "assets"> & {
    assets?: AssetItem[];
    locationAssets?: LocationAssetItem[];
  };
};

export type CreatePublicTicketPayload = {
  token: string;
  description: string;
  categoryId: number;
  priorityId: number;

  reporterType: "CLIENT" | "STAFF" | "VISITOR" | "OTHER" | "ANONYMOUS";

  fullName?: string;
  phone?: string;
  email?: string;
  roomNumber?: string;
  reservationCode?: string;

  assetIds?: number[];
  files?: ImagePicker.ImagePickerAsset[];
};

const getAssetFileName = (
  asset: ImagePicker.ImagePickerAsset,
  index: number
) => {
  if (asset.fileName) {
    return asset.fileName;
  }

  const extension = asset.uri.split(".").pop()?.split("?")[0] || "jpg";

  return `public-ticket-photo-${Date.now()}-${index}.${extension}`;
};

const getAssetMimeType = (asset: ImagePicker.ImagePickerAsset) => {
  if (asset.mimeType) {
    return asset.mimeType;
  }

  const uri = asset.uri.toLowerCase();

  if (uri.endsWith(".png")) return "image/png";
  if (uri.endsWith(".webp")) return "image/webp";
  if (uri.endsWith(".heic")) return "image/heic";

  return "image/jpeg";
};

const normalizeQrInfo = (rawQrInfo: RawPublicQrInfo): PublicQrInfo => {
  const locationAssets = rawQrInfo.location.locationAssets ?? [];

  const assets =
    rawQrInfo.location.assets ??
    locationAssets
      .filter(
        (locationAsset) =>
          locationAsset.isActive !== false &&
          locationAsset.asset?.isActive !== false
      )
      .map((locationAsset) => ({
        ...locationAsset.asset,
        name: locationAsset.label?.trim() || locationAsset.asset.name,
      }));

  return {
    ...rawQrInfo,
    location: {
      ...rawQrInfo.location,
      assets,
    },
  };
};

const getUniqueAssetIds = (assetIds?: number[]) => {
  return [...new Set((assetIds ?? []).filter(Number.isInteger))];
};

export const publicQrService = {
  getQrInfo: async (token: string): Promise<PublicQrInfo> => {
    const response = await api.get(`/public/qr/${token}`);

    const rawQrInfo = (response.data?.data ??
      response.data) as RawPublicQrInfo;

    return normalizeQrInfo(rawQrInfo);
  },

  createTicket: async (payload: CreatePublicTicketPayload) => {
    const formData = new FormData();

    formData.append("token", payload.token);
    formData.append("description", payload.description);
    formData.append("categoryId", String(payload.categoryId));
    formData.append("priorityId", String(payload.priorityId));
    formData.append("reporterType", payload.reporterType);

    if (payload.fullName?.trim()) {
      formData.append("fullName", payload.fullName.trim());
    }

    if (payload.phone?.trim()) {
      formData.append("phone", payload.phone.trim());
    }

    if (payload.email?.trim()) {
      formData.append("email", payload.email.trim());
    }

    if (payload.roomNumber?.trim()) {
      formData.append("roomNumber", payload.roomNumber.trim());
    }

    if (payload.reservationCode?.trim()) {
      formData.append("reservationCode", payload.reservationCode.trim());
    }

    const assetIds = getUniqueAssetIds(payload.assetIds);

    if (assetIds.length > 0) {
      formData.append("assetIds", JSON.stringify(assetIds));
    }

    if (payload.files && payload.files.length > 0) {
      payload.files.forEach((file, index) => {
        formData.append(
          "files",
          {
            uri: file.uri,
            name: getAssetFileName(file, index),
            type: getAssetMimeType(file),
          } as unknown as Blob
        );
      });
    }

    const response = await api.post("/public/tickets", formData, {
      headers: {
        Accept: "application/json",
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data?.data ?? response.data;
  },

  getCategories: async (): Promise<CategoryItem[]> => {
    const response = await api.get("/public/categories");

    return response.data?.data ?? response.data ?? [];
  },

  getPriorities: async (): Promise<PriorityItem[]> => {
    const response = await api.get("/public/priorities");

    return response.data?.data ?? response.data ?? [];
  },
};