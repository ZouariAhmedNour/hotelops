import api from "./api";

export const locationService = {
  getAll: () => api.get("/locations"),
  getById: (id: number) => api.get(`/locations/${id}`),
};