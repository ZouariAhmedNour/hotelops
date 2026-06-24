import { Link } from "react-router-dom";

import Card from "../../../shared/components/ui/Card";
import type { MaintenanceTicket } from "../types/maintenance.types";
import TicketStatusBadge from "./TicketStatusBadge";
import { isPartiallyResolvedStatus } from "../utils/ticketStatus";

interface TicketRelationsCardProps {
  ticket: MaintenanceTicket;
}

const TicketRelationsCard = ({
  ticket,
}: TicketRelationsCardProps) => {
  const isPartiallyResolved = isPartiallyResolvedStatus(ticket.status);

  const followUpTickets = ticket.followUpTickets ?? [];

  const hasContent =
    isPartiallyResolved ||
    Boolean(ticket.parentTicket) ||
    followUpTickets.length > 0;

  if (!hasContent) {
    return null;
  }

  return (
    <Card className="p-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-orange-100 text-lg">
          ↳
        </div>

        <div>
          <h2 className="text-2xl font-semibold text-[#13234b]">
            Tickets liés et suivi
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Suivi des interventions temporaires et des escalades techniques.
          </p>
        </div>
      </div>

      {ticket.parentTicket && (
        <div className="mt-6 rounded-2xl border border-blue-100 bg-blue-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-600">
            Ticket parent
          </p>

          <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-semibold text-slate-900">
                {ticket.parentTicket.ticketNumber}
              </p>

              <p className="mt-1 text-sm text-slate-600">
                {ticket.parentTicket.title}
              </p>
            </div>

            <Link
              to={`/tickets/${ticket.parentTicket.id}`}
              className="rounded-full bg-[#13234b] px-4 py-2 text-center text-sm font-semibold text-white transition hover:bg-[#0f1d3f]"
            >
              Ouvrir le parent
            </Link>
          </div>
        </div>
      )}

      {isPartiallyResolved && (
        <div className="mt-6 rounded-2xl border border-orange-200 bg-orange-50 p-5">
          <div className="flex items-center justify-between gap-4">
            <p className="font-semibold text-orange-900">
              Intervention temporairement stabilisée
            </p>

            <TicketStatusBadge status={ticket.status} />
          </div>

          <div className="mt-5 space-y-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-orange-700">
                Solution temporaire appliquée
              </p>

              <p className="mt-2 whitespace-pre-line leading-6 text-slate-700">
                {ticket.temporaryFixNote ||
                  ticket.resolutionNote ||
                  "Aucune note temporaire renseignée."}
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-orange-700">
                Intervention lourde nécessaire
              </p>

              <p className="mt-2 whitespace-pre-line leading-6 text-slate-700">
                {ticket.followUpReason ||
                  ticket.needHelpReason ||
                  "Aucune raison renseignée."}
              </p>
            </div>

            {ticket.requiresExpertIntervention && (
              <div className="rounded-xl bg-white px-4 py-3 text-sm font-medium text-orange-800">
                Intervention d’un expert ou d’un supérieur requise.
              </div>
            )}

            {ticket.recommendedSpecialty && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-orange-700">
                  Spécialité recommandée
                </p>

                <p className="mt-2 font-semibold text-slate-800">
                  {ticket.recommendedSpecialty}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {followUpTickets.length > 0 && (
        <div className="mt-6">
          <div className="flex items-center justify-between gap-4">
            <h3 className="text-lg font-semibold text-[#13234b]">
              Tickets de suivi
            </h3>

            <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-600">
              {followUpTickets.length}
            </span>
          </div>

          <div className="mt-4 space-y-3">
            {followUpTickets.map((followUpTicket) => (
              <div
                key={followUpTicket.id}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-[#13234b]">
                      {followUpTicket.ticketNumber}
                    </p>

                    <p className="mt-1 font-medium text-slate-800">
                      {followUpTicket.title}
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                      {followUpTicket.priority?.name || "Priorité inconnue"}
                      {" · "}
                      {followUpTicket.category?.name || "Catégorie inconnue"}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    {followUpTicket.status && (
                      <TicketStatusBadge
                        status={{
                          id: followUpTicket.status.id ?? 0,
                          name: followUpTicket.status.name ?? "Statut",
                          code: followUpTicket.status.code ?? "UNKNOWN",
                          color: followUpTicket.status.color,
                          isFinal:
                            followUpTicket.status.isFinal ?? false,
                        }}
                      />
                    )}

                    <Link
                      to={`/tickets/${followUpTicket.id}`}
                      className="rounded-full bg-[#13234b] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#0f1d3f]"
                    >
                      Ouvrir
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
};

export default TicketRelationsCard;