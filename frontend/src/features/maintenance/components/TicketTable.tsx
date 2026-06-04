import { Link } from "react-router-dom";
import type { MaintenanceTicket } from "../types/maintenance.types";
import TicketStatusBadge from "./TicketStatusBadge";
import { formatDate } from "../../../shared/utils/date";

interface TicketTableProps {
  tickets: MaintenanceTicket[];
}

const TicketTable = ({ tickets }: TicketTableProps) => {
  return (
    <div className="overflow-hidden rounded-3xl bg-white shadow-[0_2px_20px_rgba(15,23,42,0.06)]">
      <table className="w-full">
        <thead className="bg-slate-50">
          <tr>
            {["N°", "Titre", "Statut", "Priorité", "Assigné à", "Créé le"].map(
              (header) => (
                <th
                  key={header}
                  className="px-4 py-3 text-left text-sm font-medium text-slate-600"
                >
                  {header}
                </th>
              )
            )}
          </tr>
        </thead>

        <tbody className="divide-y divide-slate-100">
          {tickets.map((ticket) => (
            <tr key={ticket.id} className="hover:bg-slate-50">
              <td className="px-4 py-3 text-sm font-mono">
                <Link
                  to={`/tickets/${ticket.id}`}
                  className="text-[#13234b] hover:underline"
                >
                  {ticket.ticketNumber}
                </Link>
              </td>

              <td className="px-4 py-3 text-sm">{ticket.title}</td>

              <td className="px-4 py-3">
                <TicketStatusBadge status={ticket.status} />
              </td>

              <td className="px-4 py-3 text-sm">{ticket.priority.name}</td>

              <td className="px-4 py-3 text-sm">
                {ticket.assignedTo ? (
                  `${ticket.assignedTo.firstName} ${ticket.assignedTo.lastName}`
                ) : (
                  <span className="italic text-slate-400">Non assigné</span>
                )}
              </td>

              <td className="px-4 py-3 text-sm text-slate-500">
                {formatDate(ticket.createdAt)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TicketTable;