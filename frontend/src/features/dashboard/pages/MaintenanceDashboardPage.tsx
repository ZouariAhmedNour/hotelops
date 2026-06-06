import { Link } from "react-router-dom";
import { useCallback, useEffect, useState } from "react";

import Button from "../../../shared/components/ui/Button";
import Card from "../../../shared/components/ui/Card";
import LoadingState from "../../../shared/components/feedback/LoadingState";
import ErrorState from "../../../shared/components/feedback/ErrorState";
import { useAuth } from "../../auth/contexts/useAuth";

import { ticketService } from "../../maintenance/api/ticket.service";
import type {
  MaintenanceTicket,
  TicketStatsOverview,
} from "../../maintenance/types/maintenance.types";

import TicketStatusBadge from "../../maintenance/components/TicketStatusBadge";
import { formatDateTime } from "../../../shared/utils/date";

interface DashboardState {
  stats: TicketStatsOverview | null;
  unassignedTickets: MaintenanceTicket[];
  criticalTickets: MaintenanceTicket[];
  recentTickets: MaintenanceTicket[];
  error: string;
  loaded: boolean;
}

const initialState: DashboardState = {
  stats: null,
  unassignedTickets: [],
  criticalTickets: [],
  recentTickets: [],
  error: "",
  loaded: false,
};

const MaintenanceDashboardPage = () => {
  const { user } = useAuth();

  const [state, setState] = useState<DashboardState>(initialState);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboardData = useCallback(async () => {
    try {
      setRefreshing(true);

      const [statsData, unassignedData, criticalData, recentData] =
        await Promise.all([
          ticketService.statsOverview(),

          ticketService.list({
            page: 1,
            limit: 5,
            unassignedOnly: true,
            sortBy: "createdAt",
            sortOrder: "desc",
          }),

          ticketService.list({
            page: 1,
            limit: 5,
            priorityCode: "CRITICAL",
            sortBy: "createdAt",
            sortOrder: "desc",
          }),

          ticketService.list({
            page: 1,
            limit: 8,
            sortBy: "createdAt",
            sortOrder: "desc",
          }),
        ]);

      setState({
        stats: statsData,
        unassignedTickets: unassignedData.data,
        criticalTickets: criticalData.data,
        recentTickets: recentData.data,
        error: "",
        loaded: true,
      });
    } catch (err) {
      console.error(err);

      setState((previous) => ({
        ...previous,
        error: "Impossible de charger le dashboard maintenance.",
        loaded: true,
      }));
    } finally {
      setRefreshing(false);
    }
  }, []);

useEffect(() => {
  const timer = window.setTimeout(() => {
    void fetchDashboardData();
  }, 0);

  return () => {
    window.clearTimeout(timer);
  };
}, [fetchDashboardData]);

  if (!state.loaded) {
    return <LoadingState label="Chargement du dashboard maintenance..." />;
  }

  if (state.error) {
    return <ErrorState message={state.error} />;
  }

  const stats = state.stats;

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
            Opérations & Maintenance
          </p>

          <p className="mt-2 text-slate-500">
            Bonjour, {user?.firstName}. Inspectez les tickets et assignez-les aux
            agents disponibles.
          </p>

          <h1 className="mt-2 text-5xl font-semibold tracking-tight text-[#13234b]">
            Tableau de bord maintenance
          </h1>
        </div>

        <div className="flex gap-3">
          <Button
            type="button"
            variant="secondary"
            onClick={() => void fetchDashboardData()}
            disabled={refreshing}
            className="rounded-full bg-white px-5 py-3 text-sm shadow-sm"
          >
            {refreshing ? "Actualisation..." : "Actualiser"}
          </Button>

          <Link to="/tickets">
            <Button className="rounded-full px-5 py-3 text-sm">
              Tous les tickets
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
        <DashboardStatCard label="Total" value={stats?.total ?? 0} />

        <DashboardStatCard
          label="Nouveaux"
          value={stats?.new ?? 0}
          className="text-blue-700"
        />

        <DashboardStatCard
          label="Assignés"
          value={stats?.assigned ?? 0}
          className="text-amber-700"
        />

        <DashboardStatCard
          label="En cours"
          value={stats?.inProgress ?? 0}
          className="text-indigo-700"
        />

        <DashboardStatCard
          label="Critiques"
          value={stats?.critical ?? 0}
          className="text-red-700"
          cardClassName="border-b-4 border-red-500 bg-red-50"
        />

        <DashboardStatCard
          label="En retard"
          value={stats?.overdue ?? 0}
          className="text-orange-700"
          cardClassName="border-b-4 border-orange-500"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="p-6">
          <DashboardSectionHeader
            title="Tickets non assignés"
            description="Ces tickets doivent être inspectés puis assignés à un agent."
            link="/tickets?unassignedOnly=true"
          />

          <div className="mt-6 space-y-3">
            {state.unassignedTickets.length === 0 ? (
              <EmptyBox message="Aucun ticket non assigné." />
            ) : (
              state.unassignedTickets.map((ticket) => (
                <TicketMiniRow key={ticket.id} ticket={ticket} />
              ))
            )}
          </div>
        </Card>

        <Card className="p-6">
          <DashboardSectionHeader
            title="Tickets critiques"
            description="Priorité immédiate pour le chef maintenance."
            link="/tickets?priorityCode=CRITICAL"
          />

          <div className="mt-6 space-y-3">
            {state.criticalTickets.length === 0 ? (
              <EmptyBox message="Aucun ticket critique." />
            ) : (
              state.criticalTickets.map((ticket) => (
                <TicketMiniRow key={ticket.id} ticket={ticket} />
              ))
            )}
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-3xl font-semibold text-[#13234b]">
              Tickets récents
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Cliquez sur Inspecter pour ouvrir le ticket et choisir un agent
              recommandé.
            </p>
          </div>

          <Link to="/tickets">
            <Button variant="secondary" className="rounded-full bg-white px-5 py-3">
              Liste complète
            </Button>
          </Link>
        </div>

        <div className="space-y-3">
          {state.recentTickets.length === 0 ? (
            <EmptyBox message="Aucun ticket récent." />
          ) : (
            state.recentTickets.map((ticket) => (
              <TicketDashboardRow key={ticket.id} ticket={ticket} />
            ))
          )}
        </div>
      </Card>
    </div>
  );
};

interface DashboardStatCardProps {
  label: string;
  value: number;
  className?: string;
  cardClassName?: string;
}

const DashboardStatCard = ({
  label,
  value,
  className = "text-[#13234b]",
  cardClassName = "",
}: DashboardStatCardProps) => {
  return (
    <Card className={`p-5 ${cardClassName}`}>
      <p className="text-sm uppercase tracking-[0.18em] text-slate-400">
        {label}
      </p>

      <p className={`mt-4 text-4xl font-semibold ${className}`}>{value}</p>
    </Card>
  );
};

interface DashboardSectionHeaderProps {
  title: string;
  description: string;
  link: string;
}

const DashboardSectionHeader = ({
  title,
  description,
  link,
}: DashboardSectionHeaderProps) => {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <h2 className="text-2xl font-semibold text-[#13234b]">{title}</h2>

        <p className="mt-1 text-sm text-slate-500">{description}</p>
      </div>

      <Link
        to={link}
        className="shrink-0 text-sm font-semibold text-[#13234b] hover:underline"
      >
        Voir tout
      </Link>
    </div>
  );
};

interface TicketMiniRowProps {
  ticket: MaintenanceTicket;
}

const TicketMiniRow = ({ ticket }: TicketMiniRowProps) => {
  return (
    <Link
      to={`/tickets/${ticket.id}`}
      className="block rounded-2xl border border-slate-100 bg-slate-50 p-4 transition hover:-translate-y-0.5 hover:bg-white hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
            {ticket.ticketNumber}
          </p>

          <p className="mt-2 font-semibold text-slate-900">{ticket.title}</p>

          <p className="mt-1 text-sm text-slate-500">
            {ticket.location.name} • {ticket.category.name}
          </p>

          <p className="mt-1 text-xs text-slate-400">
            {formatDateTime(ticket.createdAt)}
          </p>
        </div>

        <span className="rounded-full bg-[#13234b] px-3 py-1 text-xs font-semibold text-white">
          Inspecter
        </span>
      </div>
    </Link>
  );
};

const TicketDashboardRow = ({ ticket }: TicketMiniRowProps) => {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm lg:flex-row lg:items-center lg:justify-between">
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
          {ticket.ticketNumber}
        </p>

        <p className="mt-2 truncate font-semibold text-slate-900">
          {ticket.title}
        </p>

        <p className="mt-1 text-sm text-slate-500">
          {ticket.location.name} • {ticket.category.name} •{" "}
          {ticket.priority.name}
        </p>

        <p className="mt-1 text-xs text-slate-400">
          {formatDateTime(ticket.createdAt)}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <TicketStatusBadge status={ticket.status} />

        {ticket.assignedTo ? (
          <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
            {ticket.assignedTo.firstName} {ticket.assignedTo.lastName}
          </span>
        ) : (
          <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
            Non assigné
          </span>
        )}

        <Link
          to={`/tickets/${ticket.id}`}
          className="rounded-full bg-[#13234b] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#0f1d3f]"
        >
          Inspecter
        </Link>
      </div>
    </div>
  );
};

interface EmptyBoxProps {
  message: string;
}

const EmptyBox = ({ message }: EmptyBoxProps) => {
  return (
    <p className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">
      {message}
    </p>
  );
};

export default MaintenanceDashboardPage;