import { useState } from "react";
import { Link, useParams } from "react-router-dom";

import ErrorState from "../../../shared/components/feedback/ErrorState";
import LoadingState from "../../../shared/components/feedback/LoadingState";
import Card from "../../../shared/components/ui/Card";
import { formatDateTime } from "../../../shared/utils/date";

import AgentRecommendations from "../../maintenance-staff/components/AgentRecommendations";

import TicketAttachments from "../components/TicketAttachments";
import TicketRelationsCard from "../components/TicketRelationsCard";
import TicketStatusBadge from "../components/TicketStatusBadge";

import { ticketService } from "../api/ticket.service";
import { useTicket } from "../hooks/useTicket";
import {
  isFinalTicketStatus,
  isPartiallyResolvedStatus,
} from "../utils/ticketStatus";

const TicketDetailPage = () => {
  const { id } = useParams();

  const ticketId = id ? Number(id) : undefined;

  const { ticket, loading, error, refetch } = useTicket(ticketId);

  const [assignMessage, setAssignMessage] = useState("");
  const [assignError, setAssignError] = useState("");

  const handleAssignAgent = async (agentUserId: number) => {
    if (!ticket) return;

    try {
      setAssignMessage("");
      setAssignError("");

      await ticketService.assign(ticket.id, agentUserId);

      setAssignMessage("Ticket assigné avec succès.");

      await refetch();
    } catch (err) {
      console.error(err);

      setAssignError("Impossible d’assigner ce ticket à cet agent.");
    }
  };

  if (loading) {
    return <LoadingState label="Chargement du ticket..." />;
  }

  if (error) {
    return <ErrorState message={error} />;
  }

  if (!ticket) {
    return (
      <ErrorState
        title="Ticket introuvable"
        message="Le ticket demandé n’existe pas."
      />
    );
  }

  const isPartiallyResolved = isPartiallyResolvedStatus(ticket.status);

  const isFinal = isFinalTicketStatus(ticket.status);

  const canAssignThisTicket = !isPartiallyResolved && !isFinal;

  const followUpTickets = ticket.followUpTickets ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
            {ticket.ticketNumber}
          </p>

          <h1 className="mt-2 text-4xl font-semibold text-[#13234b]">
            {ticket.title}
          </h1>

          <p className="mt-2 text-slate-500">
            Créé le {formatDateTime(ticket.createdAt)}
          </p>
        </div>

        <TicketStatusBadge status={ticket.status} />
      </div>

      {isPartiallyResolved && (
        <div className="rounded-2xl border border-orange-200 bg-orange-50 px-5 py-4 text-sm text-orange-900">
          <p className="font-semibold">
            Ce ticket a été stabilisé temporairement.
          </p>

          <p className="mt-1">
            Le traitement final doit être réalisé depuis le ticket de suivi.
          </p>
        </div>
      )}

      {assignMessage && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {assignMessage}
        </div>
      )}

      {assignError && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {assignError}
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="text-2xl font-semibold text-[#13234b]">
              Description
            </h2>

            <p className="mt-4 leading-7 text-slate-600">
              {ticket.description}
            </p>
          </Card>

          <TicketRelationsCard ticket={ticket} />

          <TicketAttachments attachments={ticket.attachments} />

          <div className="grid gap-6 md:grid-cols-3">
            <Card className="p-5">
              <p className="text-sm uppercase tracking-[0.18em] text-slate-400">
                Localisation
              </p>

              <p className="mt-3 text-lg font-semibold text-slate-900">
                {ticket.location.name}
              </p>
            </Card>

            <Card className="p-5">
              <p className="text-sm uppercase tracking-[0.18em] text-slate-400">
                Catégorie
              </p>

              <p className="mt-3 text-lg font-semibold text-slate-900">
                {ticket.category.name}
              </p>
            </Card>

            <Card className="p-5">
              <p className="text-sm uppercase tracking-[0.18em] text-slate-400">
                Priorité
              </p>

              <p className="mt-3 text-lg font-semibold text-slate-900">
                {ticket.priority.name}
              </p>
            </Card>
          </div>

          <Card className="p-6">
            <h2 className="text-2xl font-semibold text-[#13234b]">
              Assignation actuelle
            </h2>

            <p className="mt-4 text-slate-600">
              {ticket.assignedTo ? (
                <>
                  Assigné à{" "}
                  <span className="font-semibold text-slate-900">
                    {ticket.assignedTo.firstName}{" "}
                    {ticket.assignedTo.lastName}
                  </span>
                </>
              ) : (
                "Ce ticket n’est pas encore assigné."
              )}
            </p>
          </Card>
        </div>

        <div className="space-y-6">
          {canAssignThisTicket ? (
            <AgentRecommendations
              ticketId={ticket.id}
              onAssign={handleAssignAgent}
            />
          ) : isPartiallyResolved ? (
            <Card className="p-6">
              <h2 className="text-2xl font-semibold text-[#13234b]">
                Affectation du suivi
              </h2>

              <p className="mt-3 leading-6 text-slate-600">
                Ce ticket original ne doit plus être assigné. Affecte plutôt
                le ticket de suivi créé par l’agent.
              </p>

              {followUpTickets.length === 0 ? (
                <p className="mt-4 rounded-xl bg-orange-50 px-4 py-3 text-sm text-orange-800">
                  Aucun ticket de suivi n’a été trouvé.
                </p>
              ) : (
                <div className="mt-4 space-y-3">
                  {followUpTickets.map((followUpTicket) => (
                    <Link
                      key={followUpTicket.id}
                      to={`/tickets/${followUpTicket.id}`}
                      className="block rounded-2xl border border-blue-100 bg-blue-50 p-4 transition hover:border-blue-300"
                    >
                      <p className="font-semibold text-[#13234b]">
                        {followUpTicket.ticketNumber}
                      </p>

                      <p className="mt-1 text-sm text-slate-700">
                        {followUpTicket.title}
                      </p>

                      <p className="mt-2 text-sm font-semibold text-blue-700">
                        Ouvrir et assigner le ticket de suivi →
                      </p>
                    </Link>
                  ))}
                </div>
              )}
            </Card>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default TicketDetailPage;