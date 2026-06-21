import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import Card from "../../../shared/components/ui/Card";
import ErrorState from "../../../shared/components/feedback/ErrorState";
import LoadingState from "../../../shared/components/feedback/LoadingState";

import { maintenanceStaffService } from "../api/maintenanceStaff.service";

import type { MaintenanceAgentProfile } from "../types/maintenanceStaff.types";

import AgentStatusBadge from "../components/AgentStatusBadge";

const formatDate = (value?: string | null) => {
  if (!value) {
    return "Non renseignée";
  }

  return new Date(value).toLocaleDateString("fr-FR");
};

const getCertificationStatusClass = (status: string) => {
  const normalized = status.toUpperCase();

  if (normalized === "VALID") {
    return "bg-emerald-50 text-emerald-700";
  }

  if (normalized === "EXPIRED" || normalized === "REVOKED") {
    return "bg-red-50 text-red-700";
  }

  return "bg-amber-50 text-amber-700";
};

const AgentDetailPage = () => {
  const { id } = useParams();

  const [agent, setAgent] = useState<MaintenanceAgentProfile | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;

    const run = async () => {
      if (!id) {
        return;
      }

      try {
        setLoading(true);
        setError("");

        const data = await maintenanceStaffService.getAgentById(Number(id));

        if (!ignore) {
          setAgent(data);
        }
      } catch (err) {
        console.error(err);

        if (!ignore) {
          setError("Impossible de charger le détail de l’agent.");
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    void run();

    return () => {
      ignore = true;
    };
  }, [id]);

  if (loading) {
    return <LoadingState label="Chargement de l’agent..." />;
  }

  if (error) {
    return <ErrorState message={error} />;
  }

  if (!agent) {
    return (
      <ErrorState
        title="Agent introuvable"
        message="Aucun agent ne correspond à cet identifiant."
      />
    );
  }

  const activeTicketsCount = agent.activeTicketsCount ?? 0;
  const resolvedTicketsCount = agent.resolvedTicketsCount ?? 0;

  const loadPct =
    agent.maxActiveTickets > 0
      ? Math.round((activeTicketsCount / agent.maxActiveTickets) * 100)
      : 0;

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
            Détail agent
          </p>

          <h1 className="mt-2 text-4xl font-semibold text-[#13234b]">
            {agent.user.firstName} {agent.user.lastName}
          </h1>

          <p className="mt-2 text-slate-500">{agent.user.email}</p>
        </div>

        <AgentStatusBadge status={agent.availabilityStatus} />
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card className="p-5">
          <p className="text-sm uppercase tracking-[0.18em] text-slate-400">
            Équipe
          </p>

          <p className="mt-3 text-xl font-semibold text-[#13234b]">
            {agent.team?.name ?? "Aucune"}
          </p>
        </Card>

        <Card className="p-5">
          <p className="text-sm uppercase tracking-[0.18em] text-slate-400">
            Niveau
          </p>

          <p className="mt-3 text-xl font-semibold text-[#13234b]">
            {agent.level}
          </p>
        </Card>

        <Card className="p-5">
          <p className="text-sm uppercase tracking-[0.18em] text-slate-400">
            Tickets actifs
          </p>

          <p className="mt-3 text-xl font-semibold text-[#13234b]">
            {activeTicketsCount} / {agent.maxActiveTickets}
          </p>
        </Card>

        <Card className="p-5">
          <p className="text-sm uppercase tracking-[0.18em] text-slate-400">
            Terminés
          </p>

          <p className="mt-3 text-xl font-semibold text-emerald-600">
            {resolvedTicketsCount}
          </p>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <Card className="p-6">
          <h2 className="text-2xl font-semibold text-[#13234b]">
            Informations techniques
          </h2>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-sm text-slate-400">Shift</p>

              <p className="mt-1 font-semibold text-slate-900">
                {agent.shift}
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-sm text-slate-400">
                Spécialité principale
              </p>

              <p className="mt-1 font-semibold text-slate-900">
                {agent.mainSpecialty ?? "Non définie"}
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-sm text-slate-400">
                Autorisation critique
              </p>

              <p className="mt-1 font-semibold text-slate-900">
                {agent.canHandleCritical ? "Autorisé" : "Non autorisé"}
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-sm text-slate-400">Charge actuelle</p>

              <p className="mt-1 font-semibold text-slate-900">
                {loadPct}%
              </p>
            </div>
          </div>

          <h3 className="mt-8 text-lg font-semibold text-[#13234b]">
            Compétences
          </h3>

          <div className="mt-4 flex flex-wrap gap-2">
            {agent.skills.length === 0 ? (
              <p className="text-sm text-slate-500">Aucune compétence.</p>
            ) : (
              agent.skills.map((item) => (
                <span
                  key={item.id}
                  className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-600"
                >
                  {item.skill.name} — Niveau {item.level}
                </span>
              ))
            )}
          </div>

          <h3 className="mt-8 text-lg font-semibold text-[#13234b]">
            Certifications et formations
          </h3>

          <div className="mt-4 space-y-3">
            {agent.certifications.length === 0 ? (
              <p className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">
                Aucune certification attribuée à cet agent.
              </p>
            ) : (
              agent.certifications.map((item) => (
                <div
                  key={item.id}
                  className="rounded-2xl border border-slate-100 bg-slate-50 p-4"
                >
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                      <p className="font-semibold text-slate-900">
                        {item.certification.name}
                      </p>

                      <p className="mt-1 text-sm text-slate-500">
                        {item.certification.code}
                      </p>
                    </div>

                    <span
                      className={`w-fit rounded-full px-3 py-1 text-xs font-semibold ${getCertificationStatusClass(
                        item.status
                      )}`}
                    >
                      {item.status}
                    </span>
                  </div>

                  <div className="mt-4 grid gap-3 text-sm text-slate-600 md:grid-cols-2">
                    <p>
                      <span className="font-medium text-slate-800">
                        Organisme :
                      </span>{" "}
                      {item.provider ?? "Non renseigné"}
                    </p>

                    <p>
                      <span className="font-medium text-slate-800">
                        Numéro :
                      </span>{" "}
                      {item.certificateNumber ?? "Non renseigné"}
                    </p>

                    <p>
                      <span className="font-medium text-slate-800">
                        Obtenue :
                      </span>{" "}
                      {formatDate(item.issuedAt)}
                    </p>

                    <p>
                      <span className="font-medium text-slate-800">
                        Expire :
                      </span>{" "}
                      {formatDate(item.expiresAt)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-2xl font-semibold text-[#13234b]">
            Historique
          </h2>

          <p className="mt-4 text-sm text-slate-500">
            Les interventions assignées à cet agent apparaissent ici.
          </p>

          <div className="mt-6 space-y-3">
            {(agent.assignedTickets ?? []).length === 0 ? (
              <p className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">
                Aucun ticket assigné trouvé.
              </p>
            ) : (
              agent.assignedTickets?.map((ticket) => (
                <div key={ticket.id} className="rounded-2xl bg-slate-50 p-4">
                  <p className="font-semibold text-slate-900">
                    {ticket.ticketNumber}
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    {ticket.title}
                  </p>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AgentDetailPage;