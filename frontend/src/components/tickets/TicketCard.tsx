import { Link } from "react-router-dom";
import type { MaintenanceTicket } from "../../types";
import TicketStatusBadge from "./TicketStatusBadge";

interface Props {
  ticket: MaintenanceTicket;
}

const TicketCard: React.FC<Props> = ({ ticket }) => {
  return (
    <Link
      to={`/tickets/${ticket.id}`}
      className="block rounded-3xl border border-slate-200 bg-white p-5 transition hover:-translate-y-0.5 hover:shadow-lg"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
            {ticket.ticketNumber}
          </p>
          <h4 className="mt-2 text-lg font-semibold text-slate-900">
            {ticket.title}
          </h4>
          <p className="mt-2 text-sm text-slate-500">
            {ticket.location.name} • {ticket.category.name}
          </p>
        </div>

        <TicketStatusBadge status={ticket.status} />
      </div>

      <div className="mt-5 flex items-center justify-between text-sm text-slate-500">
        <span>{ticket.priority.name}</span>
        <span>{new Date(ticket.createdAt).toLocaleDateString("fr-FR")}</span>
      </div>
    </Link>
  );
};

export default TicketCard;