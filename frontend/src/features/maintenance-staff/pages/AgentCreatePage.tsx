import { useState } from "react";
import ErrorState from "../../../shared/components/feedback/ErrorState";
import LoadingState from "../../../shared/components/feedback/LoadingState";
import AgentForm from "../components/AgentForm";
import { useMaintenanceStaffData } from "../hooks/useMaintenanceStaffData";
import { maintenanceStaffService } from "../api/maintenanceStaff.service";
import type { CreateAgentPayload } from "../types/maintenanceStaff.types";

const AgentCreatePage = () => {
  const { teams, skills, loading, error, refetch } = useMaintenanceStaffData();

  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  const handleCreate = async (payload: CreateAgentPayload) => {
    try {
      setSubmitting(true);
      setMessage("");

      await maintenanceStaffService.createAgent(payload);
      setMessage("Agent créé avec succès.");

      await refetch();
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingState label="Chargement du formulaire agent..." />;
  if (error) return <ErrorState message={error} />;

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
          Maintenance Staff
        </p>

        <h1 className="mt-2 text-4xl font-semibold text-[#13234b]">
          Créer un agent
        </h1>

        <p className="mt-2 text-slate-500">
          Créez le compte utilisateur et le profil technique de l’agent.
        </p>
      </div>

      {message && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {message}
        </div>
      )}

      <AgentForm
        teams={teams}
        skills={skills}
        submitting={submitting}
        onCreate={handleCreate}
      />
    </div>
  );
};

export default AgentCreatePage;