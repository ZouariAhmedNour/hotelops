import api from "./api";

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
};

export const publicQrService = {
  getQrInfo: async (token: string): Promise<PublicQrInfo> => {
    const response = await api.get(`/public/qr/${token}`);
    return response.data?.data ?? response.data;
  },

  createTicket: async (payload: CreatePublicTicketPayload) => {
    const response = await api.post("/public/tickets", payload);
    return response.data?.data ?? response.data;
  },

  getCategories: async () => {
    const response = await api.get("/public/categories");
    return response.data?.data ?? response.data;
  },

  getPriorities: async () => {
    const response = await api.get("/public/priorities");
    return response.data?.data ?? response.data;
  },
};