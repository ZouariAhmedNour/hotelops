import { useParams } from "react-router-dom";
import LoadingState from "../../../shared/components/feedback/LoadingState";
import ErrorState from "../../../shared/components/feedback/ErrorState";
import Card from "../../../shared/components/ui/Card";
import { useTicket } from "../hooks/useTicket";
import TicketStatusBadge from "../components/TicketStatusBadge";
import { formatDateTime } from "../../../shared/utils/date";

const TicketDetailPage = () => {
  const { id } = useParams();

  const ticketId = id ? Number(id) : undefined;

  const { ticket, loading, error } = useTicket(ticketId);

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

      <Card className="p-6">
        <h2 className="text-2xl font-semibold text-[#13234b]">Description</h2>

        <p className="mt-4 leading-7 text-slate-600">{ticket.description}</p>
      </Card>

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
    </div>
  );
};

export default TicketDetailPage;