import { useState } from "react";

import ErrorState from "../../../shared/components/feedback/ErrorState";
import LoadingState from "../../../shared/components/feedback/LoadingState";

import { maintenanceStaffService } from "../api/maintenanceStaff.service";

import CertificationForm from "../components/CertificationForm";
import CertificationList from "../components/CertificationList";

import { useMaintenanceStaffData } from "../hooks/useMaintenanceStaffData";

import type {
  CreateCertificationPayload,
  MaintenanceCertification,
} from "../types/maintenanceStaff.types";

const MaintenanceCertificationsPage = () => {
  const {
    skills,
    certifications,
    loading,
    error,
    refetch,
  } = useMaintenanceStaffData();

  const [submitting, setSubmitting] = useState(false);

  const [editingCertification, setEditingCertification] =
    useState<MaintenanceCertification | null>(null);

  const [message, setMessage] = useState("");
  const [actionError, setActionError] = useState("");

  const handleSubmit = async (payload: CreateCertificationPayload) => {
    try {
      setSubmitting(true);
      setMessage("");
      setActionError("");

      if (editingCertification) {
        await maintenanceStaffService.updateCertification(
          editingCertification.id,
          payload
        );

        setMessage("Certification modifiée avec succès.");
        setEditingCertification(null);
      } else {
        await maintenanceStaffService.createCertification(payload);

        setMessage("Certification créée avec succès.");
      }

      await refetch(false);
    } catch (err) {
      console.error(err);

      setActionError(
        "Impossible d’enregistrer la certification. Vérifiez les données saisies."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    const confirmed = window.confirm(
      "Désactiver cette certification ? Les agents existants garderont leur historique."
    );

    if (!confirmed) {
      return;
    }

    try {
      setSubmitting(true);
      setMessage("");
      setActionError("");

      await maintenanceStaffService.deleteCertification(id);

      setMessage("Certification désactivée avec succès.");

      if (editingCertification?.id === id) {
        setEditingCertification(null);
      }

      await refetch(false);
    } catch (err) {
      console.error(err);

      setActionError("Impossible de désactiver cette certification.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingState label="Chargement des certifications..." />;
  }

  if (error) {
    return <ErrorState message={error} />;
  }

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
          Maintenance Staff
        </p>

        <h1 className="mt-2 text-4xl font-semibold text-[#13234b]">
          Certifications et formations
        </h1>

        <p className="mt-2 text-slate-500">
          Gérez les formations, habilitations et autorisations de sécurité.
        </p>
      </div>

      {message && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {message}
        </div>
      )}

      {actionError && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {actionError}
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[420px_minmax(0,1fr)]">
        <CertificationForm
          skills={skills}
          submitting={submitting}
          editingCertification={editingCertification}
          onSubmit={handleSubmit}
          onCancelEdit={() => setEditingCertification(null)}
        />

        <CertificationList
          certifications={certifications}
          submitting={submitting}
          onEdit={setEditingCertification}
          onDelete={handleDelete}
        />
      </div>
    </div>
  );
};

export default MaintenanceCertificationsPage;