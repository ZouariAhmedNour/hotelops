import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  AlertTriangle,
  ArrowLeft,
  BarChart3,
  CheckCircle2,
  Clock3,
  History,
  Repeat2,
  Wrench,
} from "lucide-react";

import Card from "../../../shared/components/ui/Card";
import Spinner from "../../../shared/components/ui/Spinner";
import EmptyState from "../../../shared/components/feedback/EmptyState";
import ErrorState from "../../../shared/components/feedback/ErrorState";
import { formatDateTime } from "../../../shared/utils/date";
import { ROUTES } from "../../../shared/config/routes";

import {
  locationApi,
  type LocationHistoryBreakdown,
  type LocationHistoryResponse,
} from "../api/locationApi";

type ApiError = {
  response?: {
    data?: {
      message?: string;
    };
  };
};

const getErrorMessage = (error: unknown, fallback: string) => {
  const apiError = error as ApiError;

  return apiError.response?.data?.message || fallback;
};

const normalizeStatusCode = (value?: string | null) => {
  return (value ?? "")
    .trim()
    .replace(/[\s-]+/g, "_")
    .toUpperCase();
};

const getStatusClasses = (code?: string | null) => {
  switch (normalizeStatusCode(code)) {
    case "NEW":
    case "OPEN":
      return "bg-amber-50 text-amber-700";

    case "ASSIGNED":
      return "bg-violet-50 text-violet-700";

    case "IN_PROGRESS":
      return "bg-blue-50 text-blue-700";

    case "PENDING":
      return "bg-slate-100 text-slate-700";

    case "PARTIALLY_RESOLVED":
    case "PARTIAL_RESOLVED":
      return "bg-orange-100 text-orange-800";

    case "RESOLVED":
      return "bg-emerald-50 text-emerald-700";

    case "CLOSED":
      return "bg-slate-200 text-slate-700";

    default:
      return "bg-slate-100 text-slate-700";
  }
};

const formatHours = (hours: number) => {
  if (hours <= 0) return "—";

  if (hours < 1) {
    return `${Math.round(hours * 60)} min`;
  }

  return `${hours.toFixed(1)} h`;
};

const formatMinutes = (minutes: number) => {
  if (minutes <= 0) return "—";

  if (minutes < 60) {
    return `${minutes} min`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  return `${hours} h ${remainingMinutes} min`;
};

const MetricCard = ({
  label,
  value,
  helper,
  icon,
  colorClass,
}: {
  label: string;
  value: string | number;
  helper: string;
  icon: React.ReactNode;
  colorClass: string;
}) => {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
            {label}
          </p>

          <p className="mt-3 text-3xl font-semibold text-[#13234b]">
            {value}
          </p>

          <p className="mt-2 text-sm text-slate-500">{helper}</p>
        </div>

        <div className={`rounded-2xl p-3 ${colorClass}`}>{icon}</div>
      </div>
    </Card>
  );
};

const BreakdownList = ({
  title,
  items,
}: {
  title: string;
  items: LocationHistoryBreakdown[];
}) => {
  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold text-[#13234b]">{title}</h2>

      {items.length === 0 ? (
        <p className="mt-4 text-sm text-slate-500">
          Aucune donnée disponible.
        </p>
      ) : (
        <div className="mt-5 space-y-4">
          {items.map((item) => (
            <div key={item.id}>
              <div className="flex items-center justify-between gap-4 text-sm">
                <span className="font-medium text-slate-700">{item.name}</span>

                <span className="font-semibold text-[#13234b]">
                  {item.count} · {item.percentage}%
                </span>
              </div>

              <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-[#13234b]"
                  style={{
                    width: `${Math.max(item.percentage, 3)}%`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};

const LocationHistoryPage = () => {
  const { id } = useParams();

  const locationId = Number(id);

  const [history, setHistory] = useState<LocationHistoryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadHistory = useCallback(async () => {
    if (!Number.isInteger(locationId) || locationId <= 0) {
      setError("Identifiant d’endroit invalide.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const data = await locationApi.getHistory(locationId);

      setHistory(data);
      setError("");
    } catch (err) {
      setError(
        getErrorMessage(
          err,
          "Impossible de charger l’historique de cet endroit."
        )
      );
    } finally {
      setLoading(false);
    }
  }, [locationId]);

  useEffect(() => {
  const timer = window.setTimeout(() => {
    void loadHistory();
  }, 0);

  return () => {
    window.clearTimeout(timer);
  };
}, [loadHistory]);
  const recurringAssets = useMemo(() => {
    return history?.assetHistory.filter((asset) => asset.isRepeated) ?? [];
  }, [history]);

  const maxTrendValue = useMemo(() => {
    if (!history) return 1;

    return Math.max(
      1,
      ...history.monthlyTrend.flatMap((item) => [
        item.count,
        item.resolvedCount,
      ])
    );
  }, [history]);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (error || !history) {
    return (
      <div className="space-y-4">
        <ErrorState
          title="Historique indisponible"
          message={error || "Aucune donnée trouvée."}
        />

        <button
          type="button"
          onClick={() => {
            void loadHistory();
          }}
          className="rounded-full bg-[#13234b] px-5 py-3 text-sm font-semibold text-white"
        >
          Réessayer
        </button>
      </div>
    );
  }

  const { location, summary } = history;

  return (
    <div className="space-y-6">
      <Link
        to={ROUTES.LOCATIONS}
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-[#13234b]"
      >
        <ArrowLeft size={17} />
        Retour aux endroits
      </Link>

      <div className="flex flex-col gap-5 rounded-[30px] bg-[#13234b] p-7 text-white lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-white/15 p-3">
              <History size={27} />
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-200">
                Historique maintenance
              </p>

              <h1 className="mt-1 text-3xl font-semibold">
                {location.name}
              </h1>
            </div>
          </div>

          <p className="mt-5 max-w-3xl leading-6 text-blue-100">
            Analyse des interventions, catégories signalées, équipements
            récurrents, suivi des tickets et indicateurs de maintenance.
          </p>
        </div>

        <div className="rounded-2xl bg-white/10 px-5 py-4">
          <p className="text-xs uppercase tracking-[0.16em] text-blue-200">
            Code endroit
          </p>

          <p className="mt-2 text-lg font-semibold">{location.code}</p>

          <p className="mt-2 text-sm text-blue-100">
            {location.floor ? `Étage ${location.floor}` : "Sans étage"}
            {location.zone ? ` · ${location.zone}` : ""}
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Interventions"
          value={summary.totalInterventions}
          helper={`${summary.rootIncidents} incident(s) racine`}
          colorClass="bg-blue-50 text-blue-700"
          icon={<Wrench size={23} />}
        />

        <MetricCard
          label="En cours"
          value={summary.activeInterventions}
          helper={`${summary.inProgress} intervention(s) démarrée(s)`}
          colorClass="bg-violet-50 text-violet-700"
          icon={<Clock3 size={23} />}
        />

        <MetricCard
          label="Partiellement résolus"
          value={summary.partiallyResolved}
          helper={`${summary.followUpTickets} ticket(s) de suivi`}
          colorClass="bg-orange-50 text-orange-700"
          icon={<AlertTriangle size={23} />}
        />

        <MetricCard
          label="Équipements récurrents"
          value={summary.repeatAssetCount}
          helper={`${summary.assetsMentionedCount} équipement(s) signalé(s)`}
          colorClass="bg-red-50 text-red-700"
          icon={<Repeat2 size={23} />}
        />

        <MetricCard
          label="Résolution moyenne"
          value={formatHours(summary.averageResolutionHours)}
          helper={`${summary.resolved} ticket(s) résolu(s)`}
          colorClass="bg-emerald-50 text-emerald-700"
          icon={<CheckCircle2 size={23} />}
        />

        <MetricCard
          label="Temps déclaré"
          value={formatMinutes(summary.totalTimeSpentMinutes)}
          helper={`Moyenne : ${formatMinutes(
            summary.averageTimeSpentMinutes
          )}`}
          colorClass="bg-slate-100 text-slate-700"
          icon={<BarChart3 size={23} />}
        />

        <MetricCard
          label="Critiques"
          value={summary.critical}
          helper={`${summary.overdue} ticket(s) en retard`}
          colorClass="bg-rose-50 text-rose-700"
          icon={<AlertTriangle size={23} />}
        />

        <MetricCard
          label="Équipements non signalés"
          value={summary.assetsNeverMentionedCount}
          helper="Jamais associés à un ticket"
          colorClass="bg-cyan-50 text-cyan-700"
          icon={<History size={23} />}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.8fr)]">
        <Card className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-[#13234b]">
                Tendance des 6 derniers mois
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Tickets créés et tickets résolus par mois.
              </p>
            </div>

            <div className="flex gap-3 text-xs font-semibold">
              <span className="inline-flex items-center gap-2 text-[#13234b]">
                <span className="h-3 w-3 rounded-full bg-[#13234b]" />
                Créés
              </span>

              <span className="inline-flex items-center gap-2 text-emerald-700">
                <span className="h-3 w-3 rounded-full bg-emerald-500" />
                Résolus
              </span>
            </div>
          </div>

          <div className="mt-8 flex h-56 items-end justify-between gap-3">
            {history.monthlyTrend.map((item) => (
              <div
                key={item.key}
                className="flex min-w-0 flex-1 flex-col items-center gap-3"
              >
                <div className="flex h-44 items-end gap-1">
                  <div
                    title={`${item.count} ticket(s) créé(s)`}
                    className="w-4 rounded-t-md bg-[#13234b]"
                    style={{
                      height: `${Math.max(
                        8,
                        (item.count / maxTrendValue) * 150
                      )}px`,
                    }}
                  />

                  <div
                    title={`${item.resolvedCount} ticket(s) résolu(s)`}
                    className="w-4 rounded-t-md bg-emerald-500"
                    style={{
                      height: `${Math.max(
                        8,
                        (item.resolvedCount / maxTrendValue) * 150
                      )}px`,
                    }}
                  />
                </div>

                <div className="text-center">
                  <p className="text-xs font-semibold text-slate-600">
                    {item.label}
                  </p>

                  <p className="mt-1 text-[11px] text-slate-400">
                    {item.count} / {item.resolvedCount}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <div className="grid gap-6">
          <BreakdownList
            title="Catégories les plus signalées"
            items={history.categoryBreakdown}
          />

          <BreakdownList
            title="Priorités rencontrées"
            items={history.priorityBreakdown}
          />
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <BreakdownList
          title="Répartition par statut"
          items={history.statusBreakdown}
        />

        <Card className="p-6">
          <h2 className="text-xl font-semibold text-[#13234b]">
            Lecture rapide
          </h2>

          <div className="mt-5 space-y-4 text-sm leading-6 text-slate-600">
            <p>
              <span className="font-semibold text-[#13234b]">
                {summary.rootIncidents}
              </span>{" "}
              incident(s) distinct(s) ont été signalés dans cet endroit.
            </p>

            <p>
              <span className="font-semibold text-[#13234b]">
                {summary.repeatAssetCount}
              </span>{" "}
              équipement(s) ont été impliqués dans au moins deux incidents
              distincts.
            </p>

            <p>
              Les tickets de suivi sont visibles dans l’historique, mais ils ne
              gonflent pas artificiellement la récurrence d’un même incident.
            </p>
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-[#13234b]">
              Équipements les plus récurrents
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Un équipement devient récurrent après au moins deux incidents
              distincts.
            </p>
          </div>

          <span className="rounded-full bg-red-50 px-4 py-2 text-sm font-semibold text-red-700">
            {recurringAssets.length} récurrent(s)
          </span>
        </div>

        {recurringAssets.length === 0 ? (
          <EmptyState
            title="Aucun équipement récurrent"
            message="Aucun équipement n’a encore été signalé dans plusieurs incidents distincts."
          />
        ) : (
          <div className="mt-6 overflow-x-auto">
            <table className="w-full min-w-[780px]">
              <thead className="border-b border-slate-100 text-left">
                <tr>
                  <th className="pb-3 text-sm font-semibold text-slate-500">
                    Équipement
                  </th>

                  <th className="pb-3 text-sm font-semibold text-slate-500">
                    Incidents
                  </th>

                  <th className="pb-3 text-sm font-semibold text-slate-500">
                    Tickets
                  </th>

                  <th className="pb-3 text-sm font-semibold text-slate-500">
                    Catégorie fréquente
                  </th>

                  <th className="pb-3 text-sm font-semibold text-slate-500">
                    Dernier signalement
                  </th>

                  <th className="pb-3 text-sm font-semibold text-slate-500">
                    État
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {recurringAssets.map((asset) => (
                  <tr key={asset.assetId}>
                    <td className="py-4">
                      <p className="font-semibold text-[#13234b]">
                        {asset.name}
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        {asset.code}
                        {asset.category ? ` · ${asset.category}` : ""}
                      </p>
                    </td>

                    <td className="py-4 font-semibold text-red-700">
                      {asset.incidentCount}
                    </td>

                    <td className="py-4 text-slate-700">
                      {asset.ticketCount}
                    </td>

                    <td className="py-4 text-slate-600">
                      {asset.topCategory || "Non définie"}
                    </td>

                    <td className="py-4 text-sm text-slate-500">
                      {asset.lastReportedAt
                        ? formatDateTime(asset.lastReportedAt)
                        : "—"}
                    </td>

                    <td className="py-4">
                      {asset.openTicketCount > 0 ? (
                        <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                          {asset.openTicketCount} ouvert(s)
                        </span>
                      ) : (
                        <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                          Aucun ticket actif
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Card className="p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-[#13234b]">
              Historique des interventions
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {history.interventions.length} ticket(s) lié(s) à cet endroit.
            </p>
          </div>
        </div>

        {history.interventions.length === 0 ? (
          <EmptyState
            title="Aucune intervention"
            message="Aucun ticket de maintenance n’a encore été créé pour cet endroit."
          />
        ) : (
          <div className="mt-6 space-y-4">
            {history.interventions.map((intervention) => (
              <div
                key={intervention.id}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-5"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        to={ROUTES.TICKET_DETAIL.replace(
                          ":id",
                          String(intervention.id)
                        )}
                        className="font-semibold text-[#13234b] hover:underline"
                      >
                        {intervention.ticketNumber}
                      </Link>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusClasses(
                          intervention.status.code
                        )}`}
                      >
                        {intervention.status.name}
                      </span>

                      {intervention.isFollowUp && (
                        <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                          Ticket de suivi
                        </span>
                      )}

                      {intervention.isOverdue && (
                        <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
                          En retard
                        </span>
                      )}
                    </div>

                    <h3 className="mt-3 text-lg font-semibold text-slate-900">
                      {intervention.title}
                    </h3>

                    <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">
                      {intervention.description}
                    </p>

                    {intervention.ticketAssets.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {intervention.ticketAssets.map((ticketAsset) => (
                          <span
                            key={ticketAsset.id}
                            className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600"
                          >
                            {ticketAsset.asset.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="min-w-[220px] rounded-2xl bg-white p-4 text-sm">
                    <p className="font-semibold text-[#13234b]">
                      {intervention.category.name}
                    </p>

                    <p className="mt-1 text-slate-500">
                      Priorité : {intervention.priority.name}
                    </p>

                    <p className="mt-1 text-slate-500">
                      Créé : {formatDateTime(intervention.createdAt)}
                    </p>

                    {intervention.assignedTo && (
                      <p className="mt-1 text-slate-500">
                        Agent : {intervention.assignedTo.firstName}{" "}
                        {intervention.assignedTo.lastName}
                      </p>
                    )}

                    {intervention.timeSpentMinutes !== null &&
                      intervention.timeSpentMinutes !== undefined && (
                        <p className="mt-1 text-slate-500">
                          Temps : {formatMinutes(intervention.timeSpentMinutes)}
                        </p>
                      )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default LocationHistoryPage;