import { API_SERVER_URL } from "../services/api";

export const getAttachmentUrl = (filePath: string) => {
  const normalizedPath = filePath.replaceAll("\\", "/");

  if (normalizedPath.startsWith("http")) {
    return normalizedPath;
  }

  const uploadsIndex = normalizedPath.toLowerCase().lastIndexOf("/uploads/");

  if (uploadsIndex !== -1) {
    return `${API_SERVER_URL}${normalizedPath.slice(uploadsIndex)}`;
  }

  if (normalizedPath.startsWith("/uploads/")) {
    return `${API_SERVER_URL}${normalizedPath}`;
  }

  if (normalizedPath.startsWith("uploads/")) {
    return `${API_SERVER_URL}/${normalizedPath}`;
  }

  return `${API_SERVER_URL}/${normalizedPath}`;
};