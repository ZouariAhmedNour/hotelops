import { useState } from "react";
import ErrorState from "../../../shared/components/feedback/ErrorState";
import LoadingState from "../../../shared/components/feedback/LoadingState";
import TeamForm from "../components/TeamForm";
import TeamList from "../components/TeamList";
import { useMaintenanceStaffData } from "../hooks/useMaintenanceStaffData";
import { maintenanceStaffService } from "../api/maintenanceStaff.service";
import type {
  CreateTeamPayload,
  MaintenanceTeam,
} from "../types/maintenanceStaff.types";

const MaintenanceTeamsPage = () => {
  const { teams, loading, error, refetch } = useMaintenanceStaffData();

  const [submitting, setSubmitting] = useState(false);
  const [editingTeam, setEditingTeam] = useState<MaintenanceTeam | null>(null);
  const [message, setMessage] = useState("");

  const handleSubmit = async (payload: CreateTeamPayload) => {
    try {
      setSubmitting(true);
      setMessage("");

      if (editingTeam) {
        await maintenanceStaffService.updateTeam(editingTeam.id, payload);
        setMessage("Équipe modifiée avec succès.");
        setEditingTeam(null);
      } else {
        await maintenanceStaffService.createTeam(payload);
        setMessage("Équipe créée avec succès.");
      }

      await refetch();
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Supprimer cette équipe ?")) return;

    try {
      setSubmitting(true);
      setMessage("");

      await maintenanceStaffService.deleteTeam(id);
      setMessage("Équipe supprimée avec succès.");

      await refetch();
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingState label="Chargement des équipes..." />;
  if (error) return <ErrorState message={error} />;

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
          Maintenance Staff
        </p>

        <h1 className="mt-2 text-4xl font-semibold text-[#13234b]">
          Équipes maintenance
        </h1>

        <p className="mt-2 text-slate-500">
          Ajoutez, modifiez et supprimez les équipes techniques.
        </p>
      </div>

      {message && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {message}
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[420px_minmax(0,1fr)]">
        <TeamForm
          submitting={submitting}
          editingTeam={editingTeam}
          onSubmit={handleSubmit}
          onCancelEdit={() => setEditingTeam(null)}
        />

        <TeamList
          teams={teams}
          submitting={submitting}
          onEdit={setEditingTeam}
          onDelete={handleDelete}
        />
      </div>
    </div>
  );
};

export default MaintenanceTeamsPage;