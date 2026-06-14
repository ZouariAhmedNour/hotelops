export const extractQrToken = (value: string) => {
  const trimmed = value.trim();

  if (trimmed.startsWith("hotelops://scan/")) {
    return trimmed.replace("hotelops://scan/", "").trim();
  }

  if (trimmed.includes("/scan/")) {
    const parts = trimmed.split("/scan/");
    return parts[1]?.trim() || "";
  }

  return trimmed;
};