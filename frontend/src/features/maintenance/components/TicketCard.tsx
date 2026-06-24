import { Link } from "react-router-dom";

import { formatDate } from "../../../shared/utils/date";
import type { MaintenanceTicket } from "../types/maintenance.types";
import {
  isPartiallyResolvedStatus,
  normalizeTicketStatusCode,
} from "../utils/ticketStatus";
import TicketStatusBadge from "./TicketStatusBadge";

interface TicketCardProps {
  ticket: MaintenanceTicket;
}

const TicketCard = ({ ticket }: TicketCardProps) => {
  const isPartiallyResolved = isPartiallyResolvedStatus(ticket.status);

  const isFollowUp =
    Boolean(ticket.parentTicketId) ||
    ticket.reportedFrom === "agent_follow_up";

  const progress = Math.max(0, Math.min(100, ticket.progress ?? 0));

  const followUpCount =
    ticket.followUpTickets?.length ??
    ticket._count?.followUpTickets ??
    0;

  return (
    <Link
      to={`/tickets/${ticket.id}`}
      className={`block rounded-3xl border bg-white p-5 transition hover:-translate-y-0.5 hover:shadow-lg ${
        isPartiallyResolved
          ? "border-orange-200"
          : isFollowUp
          ? "border-blue-200"
          : "border-slate-200"
      }`}
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

      {(isPartiallyResolved || isFollowUp) && (
        <div className="mt-4 flex flex-wrap gap-2">
          {isPartiallyResolved && (
            <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-800">
              {followUpCount > 0
                ? `${followUpCount} ticket(s) de suivi`
                : "Suivi à créer"}
            </span>
          )}

          {isFollowUp && (
            <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-800">
              {ticket.parentTicket?.ticketNumber
                ? `Suivi de ${ticket.parentTicket.ticketNumber}`
                : "Ticket de suivi"}
            </span>
          )}
        </div>
      )}

      <div className="mt-5">
        <div className="flex items-center justify-between text-xs font-medium text-slate-500">
          <span>Progression</span>
          <span>{progress}%</span>
        </div>

        <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
          <div
            className={
              normalizeTicketStatusCode(ticket.status.code) ===
              "PARTIALLY_RESOLVED"
                ? "h-full rounded-full bg-orange-500"
                : "h-full rounded-full bg-[#13234b]"
            }
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between text-sm text-slate-500">
        <span>{ticket.priority.name}</span>
        <span>{formatDate(ticket.createdAt)}</span>
      </div>
    </Link>
  );
};

export default TicketCard;