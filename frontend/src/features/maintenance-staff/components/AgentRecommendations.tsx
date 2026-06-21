import { useEffect, useMemo, useState } from "react";

import Button from "../../../shared/components/ui/Button";
import Card from "../../../shared/components/ui/Card";

import { maintenanceStaffService } from "../api/maintenanceStaff.service";

import type {
  AgentRecommendation,
  AgentRecommendationsResponse,
  TicketRiskLevel,
} from "../types/maintenanceStaff.types";

interface AgentRecommendationsProps {
  ticketId: number;
  onAssign: (agentUserId: number) => Promise<void> | void;
}

const riskStyles: Record<TicketRiskLevel, string> = {
  LOW: "bg-emerald-50 text-emerald-700",
  MEDIUM: "bg-amber-50 text-amber-700",
  HIGH: "bg-orange-50 text-orange-700",
  CRITICAL: "bg-red-50 text-red-700",
};

const formatDate = (value?: string | null) => {
  if (!value) {
    return "Date inconnue";
  }

  return new Date(value).toLocaleDateString("fr-FR");
};

const AgentRecommendations = ({
  ticketId,
  onAssign,
}: AgentRecommendationsProps) => {
  const [data, setData] = useState<AgentRecommendationsResponse | null>(null);

  const [loading, setLoading] = useState(true);
  const [assigningUserId, setAssigningUserId] = useState<number | null>(null);

  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;

    const loadRecommendations = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await maintenanceStaffService.getRecommendations({
          ticketId,
        });

        if (!ignore) {
          setData(response);
        }
      } catch (err) {
        console.error(err);

        if (!ignore) {
          setError(
            "Impossible de charger les recommandations de sécurité pour ce ticket."
          );
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    void loadRecommendations();

    return () => {
      ignore = true;
    };
  }, [ticketId]);

  const eligibleAgents = useMemo(() => {
    if (!data) {
      return [];
    }

    return data.eligibleAgents ?? data.recommendations ?? [];
  }, [data]);

  const blockedAgents = useMemo(() => {
    return data?.blockedAgents ?? [];
  }, [data]);

  const handleAssign = async (item: AgentRecommendation) => {
    if (!item.safetyEligible) {
      return;
    }

    try {
      setAssigningUserId(item.agent.userId);
      setError("");

      await onAssign(item.agent.userId);
    } catch (err) {
      console.error(err);

      setError(
        "Assignation refusée ou impossible. Vérifiez les exigences de sécurité."
      );
    } finally {
      setAssigningUserId(null);
    }
  };

  const assessment = data?.safetyAssessment;

  return (
    <Card className="p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-[#13234b]">
            Agents recommandés
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Les agents sont filtrés selon leurs compétences, certifications,
            disponibilité, charge et shift.
          </p>
        </div>

        {assessment && (
          <div
            className={`w-fit rounded-full px-4 py-2 text-sm font-semibold ${
              riskStyles[assessment.riskLevel]
            }`}
          >
            Risque : {assessment.riskLevel} • Score {assessment.riskScore}/100
          </div>
        )}
      </div>

      {loading && (
        <p className="mt-6 text-sm text-slate-500">
          Analyse sécurité et recommandations en cours...
        </p>
      )}

      {error && (
        <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {!loading && assessment && (
        <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-5">
          <div className="flex flex-col gap-4 xl:flex-row xl:justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-900">
                Analyse de sécurité
              </p>

              <p className="mt-1 text-sm text-slate-500">
                {assessment.requiresCertifiedAgent
                  ? "Un agent certifié est obligatoire pour cette intervention."
                  : "Aucune certification obligatoire spécifique détectée."}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {assessment.requiredSkillRequirements.map((skill) => (
                <span
                  key={skill.code}
                  className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700"
                >
                  {skill.name} — Niveau {skill.minimumLevel}
                </span>
              ))}

              {assessment.requiredCertificationRequirements.map(
                (certification) => (
                  <span
                    key={certification.code}
                    className="rounded-full bg-[#13234b] px-3 py-1 text-xs font-semibold text-white"
                  >
                    {certification.name}
                  </span>
                )
              )}
            </div>
          </div>

          {assessment.safetyReasons.length > 0 && (
            <div className="mt-4 space-y-2">
              {assessment.safetyReasons.map((reason) => (
                <p
                  key={reason}
                  className="rounded-xl bg-white px-3 py-2 text-xs text-slate-600"
                >
                  {reason}
                </p>
              ))}
            </div>
          )}
        </div>
      )}

      {!loading && !error && eligibleAgents.length === 0 && (
        <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700">
          Aucun agent éligible pour cette intervention. Consultez les agents
          bloqués ou affectez un prestataire externe certifié.
        </div>
      )}

      {!loading && !error && eligibleAgents.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-[#13234b]">
            Agents éligibles
          </h3>

          <div className="mt-4 space-y-4">
            {eligibleAgents.map((item, index) => (
              <div
                key={item.agent.id}
                className="rounded-2xl border border-emerald-100 bg-emerald-50/30 p-5"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-emerald-700">
                      #{index + 1} • Score {item.score} • Éligible sécurité
                    </p>

                    <h3 className="mt-1 text-lg font-semibold text-slate-900">
                      {item.agent.user.firstName} {item.agent.user.lastName}
                    </h3>

                    <p className="mt-1 text-sm text-slate-500">
                      {item.agent.team?.name ?? "Aucune équipe"} •{" "}
                      {item.agent.level} • {item.agent.shift}
                    </p>
                  </div>

                  <Button
                    type="button"
                    disabled={assigningUserId === item.agent.userId}
                    onClick={() => handleAssign(item)}
                    className="rounded-full px-5 py-2"
                  >
                    {assigningUserId === item.agent.userId
                      ? "Assignation..."
                      : "Assigner"}
                  </Button>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {item.reasons.map((reason) => (
                    <span
                      key={reason}
                      className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-600"
                    >
                      {reason}
                    </span>
                  ))}
                </div>

                <p className="mt-4 text-xs text-slate-500">
                  Tickets actifs : {item.activeTicketsCount} • Charge :{" "}
                  {Math.round(item.loadPct)}%
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {!loading && !error && blockedAgents.length > 0 && (
        <div className="mt-8 border-t border-slate-100 pt-6">
          <h3 className="text-lg font-semibold text-[#13234b]">
            Agents bloqués pour raisons de sécurité
          </h3>

          <p className="mt-1 text-sm text-slate-500">
            Ils ne peuvent pas être assignés tant que leurs formations ou
            certifications ne sont pas conformes.
          </p>

          <div className="mt-4 space-y-4">
            {blockedAgents.map((item) => (
              <div
                key={item.agent.id}
                className="rounded-2xl border border-red-100 bg-red-50/50 p-5"
              >
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-red-700">
                      Non éligible sécurité
                    </p>

                    <h4 className="mt-1 text-lg font-semibold text-slate-900">
                      {item.agent.user.firstName} {item.agent.user.lastName}
                    </h4>

                    <p className="mt-1 text-sm text-slate-500">
                      {item.agent.team?.name ?? "Aucune équipe"} •{" "}
                      {item.agent.level}
                    </p>
                  </div>

                  <span className="w-fit rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
                    Assignation bloquée
                  </span>
                </div>

                {item.missingSkills.length > 0 && (
                  <div className="mt-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-red-700">
                      Compétences insuffisantes
                    </p>

                    <div className="mt-2 flex flex-wrap gap-2">
                      {item.missingSkills.map((skill) => (
                        <span
                          key={skill.code}
                          className="rounded-full bg-white px-3 py-1 text-xs text-red-700"
                        >
                          {skill.name} — requis niveau {skill.requiredLevel}
                          {skill.agentLevel
                            ? `, agent niveau ${skill.agentLevel}`
                            : ""}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {item.missingCertifications.length > 0 && (
                  <div className="mt-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-red-700">
                      Certifications manquantes
                    </p>

                    <div className="mt-2 flex flex-wrap gap-2">
                      {item.missingCertifications.map((certification) => (
                        <span
                          key={certification.code}
                          className="rounded-full bg-white px-3 py-1 text-xs text-red-700"
                        >
                          {certification.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {item.expiredCertifications.length > 0 && (
                  <div className="mt-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-red-700">
                      Certifications expirées
                    </p>

                    <div className="mt-2 flex flex-wrap gap-2">
                      {item.expiredCertifications.map((certification) => (
                        <span
                          key={certification.code}
                          className="rounded-full bg-white px-3 py-1 text-xs text-red-700"
                        >
                          {certification.name} • expirée le{" "}
                          {formatDate(certification.expiresAt)}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {item.criticalAuthorizationMissing && (
                  <p className="mt-4 rounded-xl bg-white px-3 py-2 text-xs font-medium text-red-700">
                    L’agent n’est pas autorisé à intervenir sur les tickets
                    critiques.
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
};

export default AgentRecommendations;