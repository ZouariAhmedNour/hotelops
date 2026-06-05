import { useEffect, useState } from "react";
import Button from "../../../shared/components/ui/Button";
import Card from "../../../shared/components/ui/Card";
import { maintenanceStaffService } from "../api/maintenanceStaff.service";
import type { AgentRecommendation } from "../types/maintenanceStaff.types";

interface AgentRecommendationsProps {
  ticketId: number;
  onAssign: (agentUserId: number) => Promise<void> | void;
}

const AgentRecommendations = ({
  ticketId,
  onAssign,
}: AgentRecommendationsProps) => {
  const [recommendations, setRecommendations] = useState<AgentRecommendation[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [assigningUserId, setAssigningUserId] = useState<number | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;

    const run = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await maintenanceStaffService.getRecommendations({
          ticketId,
        });

        if (!ignore) {
          setRecommendations(data);
        }
      } catch (err) {
        console.error(err);

        if (!ignore) {
          setError("Impossible de charger les recommandations d’agents.");
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
  }, [ticketId]);

  const handleAssign = async (agentUserId: number) => {
    try {
      setAssigningUserId(agentUserId);
      await onAssign(agentUserId);
    } finally {
      setAssigningUserId(null);
    }
  };

  return (
    <Card className="p-6">
      <h2 className="text-2xl font-semibold text-[#13234b]">
        Agents recommandés
      </h2>

      <p className="mt-2 text-sm text-slate-500">
        Recommandation basée sur la disponibilité, la spécialité, le shift et la
        charge de travail.
      </p>

      {loading && (
        <p className="mt-6 text-sm text-slate-500">
          Chargement des recommandations...
        </p>
      )}

      {error && (
        <p className="mt-6 rounded-2xl bg-red-50 p-4 text-sm text-red-700">
          {error}
        </p>
      )}

      {!loading && !error && recommendations.length === 0 && (
        <p className="mt-6 rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">
          Aucun agent recommandé pour ce ticket.
        </p>
      )}

      <div className="mt-6 space-y-4">
        {recommendations.map((item, index) => (
          <div
            key={item.agent.id}
            className="rounded-2xl border border-slate-100 bg-slate-50 p-4"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-slate-400">
                  #{index + 1} • Score {item.score}
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
                onClick={() => handleAssign(item.agent.userId)}
                className="rounded-full px-4 py-2"
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

            <p className="mt-3 text-xs text-slate-500">
              Tickets actifs : {item.activeTicketsCount} • Charge :{" "}
              {Math.round(item.loadPct)}%
            </p>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default AgentRecommendations;