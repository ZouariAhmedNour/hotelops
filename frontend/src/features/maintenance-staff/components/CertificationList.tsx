import Card from "../../../shared/components/ui/Card";

import type { MaintenanceCertification } from "../types/maintenanceStaff.types";

interface CertificationListProps {
  certifications: MaintenanceCertification[];
  submitting?: boolean;

  onEdit: (certification: MaintenanceCertification) => void;
  onDelete: (id: number) => void;
}

const CertificationList = ({
  certifications,
  submitting = false,
  onEdit,
  onDelete,
}: CertificationListProps) => {
  return (
    <Card className="p-6">
      <h2 className="text-2xl font-semibold text-[#13234b]">
        Certifications existantes
      </h2>

      <div className="mt-6 space-y-3">
        {certifications.length === 0 ? (
          <p className="text-sm text-slate-500">
            Aucune certification créée pour le moment.
          </p>
        ) : (
          certifications.map((certification) => {
            const skillNames = certification.skillLinks
              .map((link) => link.skill.name)
              .join(", ");

            return (
              <div
                key={certification.id}
                className="rounded-2xl bg-slate-50 p-5"
              >
                <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-slate-900">
                        {certification.name}
                      </p>

                      {!certification.isActive && (
                        <span className="rounded-full bg-slate-200 px-3 py-1 text-xs font-semibold text-slate-600">
                          Désactivée
                        </span>
                      )}

                      {certification.requiresExpiry && (
                        <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                          Expiration obligatoire
                        </span>
                      )}
                    </div>

                    <p className="mt-1 text-sm text-slate-500">
                      {certification.code}
                      {certification.validityMonths
                        ? ` • Validité : ${certification.validityMonths} mois`
                        : ""}
                    </p>

                    {certification.description && (
                      <p className="mt-2 max-w-2xl text-sm text-slate-500">
                        {certification.description}
                      </p>
                    )}

                    <div className="mt-3 flex flex-wrap gap-2">
                      {skillNames ? (
                        skillNames.split(", ").map((skillName) => (
                          <span
                            key={skillName}
                            className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-600"
                          >
                            {skillName}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs italic text-slate-400">
                          Aucune compétence liée
                        </span>
                      )}
                    </div>

                    <p className="mt-3 text-xs text-slate-400">
                      {certification._count?.agentCertifications ?? 0} agent(s)
                      certifié(s) •{" "}
                      {certification._count?.safetyRuleRequirements ?? 0} règle(s)
                      de sécurité liée(s)
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => onEdit(certification)}
                      disabled={submitting}
                      className="text-sm font-semibold text-[#13234b] hover:underline disabled:opacity-50"
                    >
                      Modifier
                    </button>

                    <button
                      type="button"
                      onClick={() => onDelete(certification.id)}
                      disabled={submitting}
                      className="text-sm font-semibold text-red-600 hover:underline disabled:opacity-50"
                    >
                      Désactiver
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </Card>
  );
};

export default CertificationList;