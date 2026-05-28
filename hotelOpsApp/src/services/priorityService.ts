import api from "./api";

export const priorityService = {
  getAll: () => api.get("/priorities"),
  getById: (id: number) => api.get(`/priorities/${id}`),
};