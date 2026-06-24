import type { MaintenanceStatus } from "../types/maintenance.types";

export const normalizeTicketStatusCode = (value?: string | null) => {
  return (value ?? "")
    .trim()
    .replace(/[\s-]+/g, "_")
    .toUpperCase();
};

export const isPartiallyResolvedStatus = (
  status?: Pick<MaintenanceStatus, "code"> | null
) => {
  const code = normalizeTicketStatusCode(status?.code);

  return (
    code === "PARTIALLY_RESOLVED" ||
    code === "PARTIAL_RESOLVED"
  );
};

export const isFinalTicketStatus = (
  status?: Pick<MaintenanceStatus, "code" | "isFinal"> | null
) => {
  const code = normalizeTicketStatusCode(status?.code);

  return (
    status?.isFinal === true ||
    code === "RESOLVED" ||
    code === "CLOSED" ||
    code === "CANCELLED" ||
    code === "CANCELED"
  );
};

export const getTicketStatusLabel = (
  status?: Pick<MaintenanceStatus, "name" | "code"> | null
) => {
  if (isPartiallyResolvedStatus(status)) {
    return "Partiellement résolu";
  }

  return status?.name || status?.code || "Statut inconnu";
};