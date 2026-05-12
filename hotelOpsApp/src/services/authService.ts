import api from "./api";

export type LoginPayload = {
  email: string;
  password: string;
};

export type RegisterPayload = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
};

export const authService = {
  login: async (payload: LoginPayload) => {
    const res = await api.post('/auth/login', payload);
    return res.data?.data ?? res.data;
  },

  register: async (payload: RegisterPayload) => {
    const res = await api.post('/auth/register', payload);
    return res.data?.data ?? res.data;
  },

  me: async () => {
    const res = await api.get('/auth/me');
    return res.data?.data ?? res.data;
  },
};