import { useParams } from "react-router-dom";
import LoadingState from "../../../shared/components/feedback/LoadingState";
import ErrorState from "../../../shared/components/feedback/ErrorState";
import Card from "../../../shared/components/ui/Card";
import { useTicket } from "../hooks/useTicket";
import TicketStatusBadge from "../components/TicketStatusBadge";
import { formatDateTime } from "../../../shared/utils/date";
import AgentRecommendations from "../../maintenance-staff/components/AgentRecommendations";
import { ticketService } from "../api/ticket.service";
import { useState } from "react";
import TicketAttachments from "../components/TicketAttachments";

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

  if (loading) return <LoadingState label="Chargement du ticket..." />;

  if (error) return <ErrorState message={error} />;

  if (!ticket) {
    return (
      <ErrorState
        title="Ticket introuvable"
        message="Le ticket demandé n’existe pas."
      />
    );
  }

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
                    {ticket.assignedTo.firstName} {ticket.assignedTo.lastName}
                  </span>
                </>
              ) : (
                "Ce ticket n’est pas encore assigné."
              )}
            </p>
          </Card>
        </div>

        <AgentRecommendations
          ticketId={ticket.id}
          onAssign={handleAssignAgent}
        />
      </div>
    </div>
  );
};

export default TicketDetailPage;