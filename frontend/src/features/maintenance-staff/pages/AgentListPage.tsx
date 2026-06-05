import { useMemo, useState } from "react";
import ErrorState from "../../../shared/components/feedback/ErrorState";
import LoadingState from "../../../shared/components/feedback/LoadingState";
import Input from "../../../shared/components/ui/Input";
import AgentForm from "../components/AgentForm";
import AgentTable from "../components/AgentTable";
import { useMaintenanceStaffData } from "../hooks/useMaintenanceStaffData";
import { maintenanceStaffService } from "../api/maintenanceStaff.service";
import type {
  MaintenanceAgentProfile,
  UpdateAgentPayload,
} from "../types/maintenanceStaff.types";

const AgentListPage = () => {
  const { teams, skills, agents, loading, error, refetch } =
    useMaintenanceStaffData();

  const [query, setQuery] = useState("");
  const [teamFilter, setTeamFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [editingAgent, setEditingAgent] =
    useState<MaintenanceAgentProfile | null>(null);
  const [message, setMessage] = useState("");

  const filteredAgents = useMemo(() => {
    return agents.filter((agent) => {
      const fullName = `${agent.user.firstName} ${agent.user.lastName}`.toLowerCase();
      const email = agent.user.email.toLowerCase();

      const matchesQuery =
        !query ||
        fullName.includes(query.toLowerCase()) ||
        email.includes(query.toLowerCase());

      const matchesTeam =
        !teamFilter || String(agent.teamId ?? "") === teamFilter;

      const matchesStatus =
        !statusFilter || agent.availabilityStatus === statusFilter;

      return matchesQuery && matchesTeam && matchesStatus;
    });
  }, [agents, query, teamFilter, statusFilter]);

  const handleUpdate = async (id: number, payload: UpdateAgentPayload) => {
    try {
      setSubmitting(true);
      setMessage("");

      await maintenanceStaffService.updateAgent(id, payload);
      setMessage("Agent modifié avec succès.");
      setEditingAgent(null);

      await refetch();
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Désactiver cet agent ?")) return;

    try {
      setSubmitting(true);
      setMessage("");

      await maintenanceStaffService.deleteAgent(id);
      setMessage("Agent désactivé avec succès.");

      await refetch();
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingState label="Chargement des agents..." />;
  if (error) return <ErrorState message={error} />;

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
          Maintenance Staff
        </p>

        <h1 className="mt-2 text-4xl font-semibold text-[#13234b]">
          Liste des agents
        </h1>

        <p className="mt-2 text-slate-500">
          Consultez, filtrez, modifiez ou désactivez les agents maintenance.
        </p>
      </div>

      {message && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {message}
        </div>
      )}

      {editingAgent && (
        <AgentForm
          teams={teams}
          skills={skills}
          submitting={submitting}
          editingAgent={editingAgent}
          onUpdate={handleUpdate}
          onCancelEdit={() => setEditingAgent(null)}
        />
      )}

      <div className="grid gap-4 rounded-3xl bg-white p-4 shadow-[0_2px_20px_rgba(15,23,42,0.06)] md:grid-cols-3">
        <Input
          label="Recherche"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Nom ou email..."
        />

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Équipe
          </label>

          <select
            value={teamFilter}
            onChange={(e) => setTeamFilter(e.target.value)}
            className="h-[52px] w-full rounded-2xl border border-slate-200 px-4 outline-none focus:border-[#13234b]"
          >
            <option value="">Toutes les équipes</option>
            {teams.map((team) => (
              <option key={team.id} value={team.id}>
                {team.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Disponibilité
          </label>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-[52px] w-full rounded-2xl border border-slate-200 px-4 outline-none focus:border-[#13234b]"
          >
            <option value="">Tous les statuts</option>
            <option value="AVAILABLE">Disponible</option>
            <option value="BUSY">Occupé</option>
            <option value="OFFLINE">Hors ligne</option>
            <option value="ON_LEAVE">En congé</option>
            <option value="ON_CALL">Astreinte</option>
          </select>
        </div>
      </div>

      <AgentTable
        agents={filteredAgents}
        submitting={submitting}
        onEdit={setEditingAgent}
        onDelete={handleDelete}
      />
    </div>
  );
};

export default AgentListPage;