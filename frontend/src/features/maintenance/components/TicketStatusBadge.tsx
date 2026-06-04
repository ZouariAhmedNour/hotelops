import type { MaintenanceStatus } from "../types/maintenance.types";

interface TicketStatusBadgeProps {
  status: MaintenanceStatus;
  className?: string;
}

const getStylesByCode = (code: string) => {
  switch (code.toUpperCase()) {
    case "OPEN":
    case "NEW":
      return "bg-amber-50 text-amber-700";

    case "IN_PROGRESS":
      return "bg-blue-50 text-blue-700";

    case "PENDING":
      return "bg-slate-100 text-slate-700";

    case "RESOLVED":
      return "bg-emerald-50 text-emerald-700";

    case "CLOSED":
      return "bg-slate-200 text-slate-700";

    case "CRITICAL":
      return "bg-red-50 text-red-700";

    default:
      return "bg-slate-100 text-slate-700";
  }
};

const TicketStatusBadge = ({
  status,
  className = "",
}: TicketStatusBadgeProps) => {
  const preset = getStylesByCode(status.code);

  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${preset} ${className}`}
      style={
        status.color
          ? {
              backgroundColor: status.color,
              color: "#13234b",
            }
          : undefined
      }
    >
      {status.name}
    </span>
  );
};

export default TicketStatusBadge;