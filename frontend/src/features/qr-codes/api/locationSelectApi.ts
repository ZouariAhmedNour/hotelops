import apiClient from "../../../shared/api/apiClient";
import type { HotelLocation } from "../../locations/api/locationApi";

export type LocationOption = HotelLocation;

export const locationSelectApi = {
  async getAll() {
    const response = await apiClient.get("/locations");
    return response.data.data as LocationOption[];
  },
};