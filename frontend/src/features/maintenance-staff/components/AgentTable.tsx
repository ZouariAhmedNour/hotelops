import { Link } from "react-router-dom";
import { ROUTES } from "../../../shared/config/routes";
import type { MaintenanceAgentProfile } from "../types/maintenanceStaff.types";
import AgentStatusBadge from "./AgentStatusBadge";

interface AgentTableProps {
  agents: MaintenanceAgentProfile[];
  submitting?: boolean;
  onEdit: (agent: MaintenanceAgentProfile) => void;
  onDelete: (id: number) => void;
}

const getAgentDetailPath = (id: number) => {
  return ROUTES.MAINTENANCE_STAFF_AGENT_DETAIL.replace(":id", String(id));
};

const AgentTable = ({
  agents,
  submitting = false,
  onEdit,
  onDelete,
}: AgentTableProps) => {
  return (
    <div className="overflow-hidden rounded-3xl bg-white shadow-[0_2px_20px_rgba(15,23,42,0.06)]">
      <table className="w-full">
        <thead className="bg-slate-50">
          <tr>
            <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">
              Agent
            </th>
            <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">
              Équipe
            </th>
            <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">
              Compétences
            </th>
            <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">
              Niveau
            </th>
            <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">
              Shift
            </th>
            <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">
              Statut
            </th>
            <th className="px-4 py-3 text-right text-sm font-medium text-slate-600">
              Actions
            </th>
          </tr>
        </thead>

        <tbody className="divide-y divide-slate-100">
          {agents.length === 0 ? (
            <tr>
              <td
                colSpan={7}
                className="px-4 py-8 text-center text-sm text-slate-500"
              >
                Aucun agent créé pour le moment.
              </td>
            </tr>
          ) : (
            agents.map((agent) => (
              <tr key={agent.id}>
                <td className="px-4 py-3">
                  <Link
                    to={getAgentDetailPath(agent.id)}
                    className="font-semibold text-[#13234b] hover:underline"
                  >
                    {agent.user.firstName} {agent.user.lastName}
                  </Link>

                  <p className="text-sm text-slate-500">{agent.user.email}</p>

                  {agent.employeeCode && (
                    <p className="text-xs text-slate-400">
                      Code : {agent.employeeCode}
                    </p>
                  )}
                </td>

                <td className="px-4 py-3 text-sm">
                  {agent.team?.name ?? (
                    <span className="italic text-slate-400">Aucune</span>
                  )}
                </td>

                <td className="px-4 py-3">
                  {agent.skills.length === 0 ? (
                    <span className="text-sm italic text-slate-400">
                      Aucune
                    </span>
                  ) : (
                    <div className="flex flex-wrap gap-1">
                      {agent.skills.map((agentSkill) => (
                        <span
                          key={agentSkill.id}
                          className="rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600"
                        >
                          {agentSkill.skill.name}
                        </span>
                      ))}
                    </div>
                  )}
                </td>

                <td className="px-4 py-3 text-sm">{agent.level}</td>
                <td className="px-4 py-3 text-sm">{agent.shift}</td>

                <td className="px-4 py-3 text-sm">
                  <AgentStatusBadge status={agent.availabilityStatus} />
                </td>

                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => onEdit(agent)}
                      disabled={submitting}
                      className="text-sm font-semibold text-[#13234b] hover:underline disabled:opacity-50"
                    >
                      Modifier
                    </button>

                    <button
                      type="button"
                      onClick={() => onDelete(agent.id)}
                      disabled={submitting}
                      className="text-sm font-semibold text-red-600 hover:underline disabled:opacity-50"
                    >
                      Désactiver
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default AgentTable;