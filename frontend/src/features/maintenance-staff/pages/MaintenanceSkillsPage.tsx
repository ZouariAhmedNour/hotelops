import { useState } from "react";
import ErrorState from "../../../shared/components/feedback/ErrorState";
import LoadingState from "../../../shared/components/feedback/LoadingState";
import SkillForm from "../components/SkillForm";
import { useMaintenanceStaffData } from "../hooks/useMaintenanceStaffData";
import { maintenanceStaffService } from "../api/maintenanceStaff.service";
import type {
  CreateSkillPayload,
  MaintenanceSkill,
} from "../types/maintenanceStaff.types";
import SkillList from "../components/SkillList";

const MaintenanceSkillsPage = () => {
  const { skills, loading, error, refetch } = useMaintenanceStaffData();

  const [submitting, setSubmitting] = useState(false);
  const [editingSkill, setEditingSkill] = useState<MaintenanceSkill | null>(null);
  const [message, setMessage] = useState("");

  const handleSubmit = async (payload: CreateSkillPayload) => {
    try {
      setSubmitting(true);
      setMessage("");

      if (editingSkill) {
        await maintenanceStaffService.updateSkill(editingSkill.id, payload);
        setMessage("Compétence modifiée avec succès.");
        setEditingSkill(null);
      } else {
        await maintenanceStaffService.createSkill(payload);
        setMessage("Compétence créée avec succès.");
      }

      await refetch();
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Supprimer cette compétence ?")) return;

    try {
      setSubmitting(true);
      setMessage("");

      await maintenanceStaffService.deleteSkill(id);
      setMessage("Compétence supprimée avec succès.");

      await refetch();
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingState label="Chargement des compétences..." />;
  if (error) return <ErrorState message={error} />;

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
          Maintenance Staff
        </p>

        <h1 className="mt-2 text-4xl font-semibold text-[#13234b]">
          Compétences maintenance
        </h1>

        <p className="mt-2 text-slate-500">
          Gérez les spécialités et compétences techniques.
        </p>
      </div>

      {message && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {message}
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[420px_minmax(0,1fr)]">
        <SkillForm
          submitting={submitting}
          editingSkill={editingSkill}
          onSubmit={handleSubmit}
          onCancelEdit={() => setEditingSkill(null)}
        />

        <SkillList
          skills={skills}
          submitting={submitting}
          onEdit={setEditingSkill}
          onDelete={handleDelete}
        />
      </div>
    </div>
  );
};

export default MaintenanceSkillsPage;