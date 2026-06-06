import { Link } from "react-router-dom";
import type { MaintenanceTicket } from "../types/maintenance.types";
import TicketStatusBadge from "./TicketStatusBadge";
import { formatDateTime } from "../../../shared/utils/date";

interface TicketTableProps {
  tickets: MaintenanceTicket[];
}

const getPriorityStyle = (code: string) => {
  switch (code.toUpperCase()) {
    case "CRITICAL":
      return "bg-red-50 text-red-700";
    case "HIGH":
      return "bg-orange-50 text-orange-700";
    case "MEDIUM":
      return "bg-amber-50 text-amber-700";
    case "LOW":
      return "bg-emerald-50 text-emerald-700";
    default:
      return "bg-slate-100 text-slate-600";
  }
};

const TicketTable = ({ tickets }: TicketTableProps) => {
  return (
    <div className="overflow-hidden rounded-3xl bg-white shadow-[0_2px_20px_rgba(15,23,42,0.06)]">
      <table className="w-full">
        <thead className="bg-slate-50">
          <tr>
            <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">
              Ticket
            </th>
            <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">
              Localisation
            </th>
            <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">
              Catégorie
            </th>
            <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">
              Priorité
            </th>
            <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">
              Statut
            </th>
            <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">
              Assigné à
            </th>
            <th className="px-4 py-3 text-right text-sm font-medium text-slate-600">
              Action
            </th>
          </tr>
        </thead>

        <tbody className="divide-y divide-slate-100">
          {tickets.map((ticket) => (
            <tr key={ticket.id} className="hover:bg-slate-50/70">
              <td className="px-4 py-4">
                <Link
                  to={`/tickets/${ticket.id}`}
                  className="font-semibold text-[#13234b] hover:underline"
                >
                  {ticket.ticketNumber}
                </Link>

                <p className="mt-1 max-w-[280px] truncate text-sm text-slate-600">
                  {ticket.title}
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  {formatDateTime(ticket.createdAt)}
                </p>
              </td>

              <td className="px-4 py-4 text-sm text-slate-600">
                {ticket.location.name}
              </td>

              <td className="px-4 py-4 text-sm text-slate-600">
                {ticket.category.name}
              </td>

              <td className="px-4 py-4">
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${getPriorityStyle(
                    ticket.priority.code
                  )}`}
                >
                  {ticket.priority.name}
                </span>
              </td>

              <td className="px-4 py-4">
                <TicketStatusBadge status={ticket.status} />
              </td>

              <td className="px-4 py-4 text-sm">
                {ticket.assignedTo ? (
                  <span className="font-medium text-slate-700">
                    {ticket.assignedTo.firstName} {ticket.assignedTo.lastName}
                  </span>
                ) : (
                  <span className="italic text-slate-400">Non assigné</span>
                )}
              </td>

              <td className="px-4 py-4 text-right">
                <Link
                  to={`/tickets/${ticket.id}`}
                  className="rounded-full bg-[#13234b] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#0f1d3f]"
                >
                  Inspecter
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TicketTable;