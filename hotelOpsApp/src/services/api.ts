import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const API_SERVER_URL = "http://192.168.1.105:3000";
export const API_BASE_URL = `${API_SERVER_URL}/api`;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default api;