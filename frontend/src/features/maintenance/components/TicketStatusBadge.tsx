import type { MaintenanceStatus } from "../types/maintenance.types";
import {
  getTicketStatusLabel,
  normalizeTicketStatusCode,
} from "../utils/ticketStatus";

interface TicketStatusBadgeProps {
  status: MaintenanceStatus;
  className?: string;
}

const getStylesByCode = (code: string) => {
  switch (normalizeTicketStatusCode(code)) {
    case "OPEN":
    case "NEW":
      return "bg-amber-50 text-amber-700 ring-1 ring-amber-100";

    case "ASSIGNED":
      return "bg-violet-50 text-violet-700 ring-1 ring-violet-100";

    case "IN_PROGRESS":
      return "bg-blue-50 text-blue-700 ring-1 ring-blue-100";

    case "PENDING":
      return "bg-slate-100 text-slate-700 ring-1 ring-slate-200";

    case "PARTIALLY_RESOLVED":
    case "PARTIAL_RESOLVED":
      return "bg-orange-100 text-orange-800 ring-1 ring-orange-200";

    case "RESOLVED":
      return "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100";

    case "CLOSED":
      return "bg-slate-200 text-slate-700 ring-1 ring-slate-300";

    case "CANCELLED":
    case "CANCELED":
      return "bg-red-50 text-red-700 ring-1 ring-red-100";

    default:
      return "bg-slate-100 text-slate-700 ring-1 ring-slate-200";
  }
};

const TicketStatusBadge = ({
  status,
  className = "",
}: TicketStatusBadgeProps) => {
  const normalizedCode = normalizeTicketStatusCode(status.code);

  const isKnownStatus = [
    "OPEN",
    "NEW",
    "ASSIGNED",
    "IN_PROGRESS",
    "PENDING",
    "PARTIALLY_RESOLVED",
    "PARTIAL_RESOLVED",
    "RESOLVED",
    "CLOSED",
    "CANCELLED",
    "CANCELED",
  ].includes(normalizedCode);

  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${getStylesByCode(
        status.code
      )} ${className}`}
      style={
        !isKnownStatus && status.color
          ? {
              backgroundColor: status.color,
              color: "#13234b",
            }
          : undefined
      }
    >
      {getTicketStatusLabel(status)}
    </span>
  );
};

export default TicketStatusBadge;