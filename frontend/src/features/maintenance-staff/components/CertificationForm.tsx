import { type FormEvent, useMemo, useState } from "react";

import Button from "../../../shared/components/ui/Button";
import Card from "../../../shared/components/ui/Card";
import Input from "../../../shared/components/ui/Input";

import type {
  CreateCertificationPayload,
  MaintenanceCertification,
  MaintenanceSkill,
} from "../types/maintenanceStaff.types";

interface CertificationFormProps {
  skills: MaintenanceSkill[];
  submitting?: boolean;
  editingCertification?: MaintenanceCertification | null;

  onSubmit: (
    payload: CreateCertificationPayload
  ) => Promise<void> | void;

  onCancelEdit?: () => void;
}

const getInitialForm = (
  editingCertification?: MaintenanceCertification | null
): CreateCertificationPayload => {
  return {
    name: editingCertification?.name ?? "",
    code: editingCertification?.code ?? "",
    description: editingCertification?.description ?? "",

    requiresExpiry: editingCertification?.requiresExpiry ?? false,
    validityMonths: editingCertification?.validityMonths ?? undefined,

    skillIds:
      editingCertification?.skillLinks.map((item) => item.skillId) ?? [],
  };
};

const CertificationFormContent = ({
  skills,
  submitting = false,
  editingCertification,
  onSubmit,
  onCancelEdit,
}: CertificationFormProps) => {
  const [form, setForm] = useState<CreateCertificationPayload>(() =>
    getInitialForm(editingCertification)
  );

  const activeSkills = useMemo(() => {
    return skills.filter((skill) => skill.isActive);
  }, [skills]);

  const toggleSkill = (skillId: number) => {
    setForm((previousForm) => {
      const currentSkillIds = previousForm.skillIds ?? [];

      const nextSkillIds = currentSkillIds.includes(skillId)
        ? currentSkillIds.filter((id) => id !== skillId)
        : [...currentSkillIds, skillId];

      return {
        ...previousForm,
        skillIds: nextSkillIds,
      };
    });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    await onSubmit({
      name: form.name.trim(),
      code: form.code.trim().toUpperCase(),
      description: form.description?.trim() || undefined,

      requiresExpiry: Boolean(form.requiresExpiry),

      validityMonths: form.requiresExpiry
        ? Number(form.validityMonths) || null
        : null,

      skillIds: form.skillIds ?? [],
    });

    // Après une création, on vide le formulaire.
    if (!editingCertification) {
      setForm(getInitialForm(null));
    }
  };

  return (
    <Card className="p-6">
      <h2 className="text-2xl font-semibold text-[#13234b]">
        {editingCertification
          ? "Modifier la certification"
          : "Créer une certification"}
      </h2>

      <p className="mt-2 text-sm text-slate-500">
        Une certification est liée à une ou plusieurs compétences techniques.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-5">
        <Input
          label="Nom"
          value={form.name}
          onChange={(e) =>
            setForm((previousForm) => ({
              ...previousForm,
              name: e.target.value,
            }))
          }
          placeholder="Habilitation électrique BR"
          required
        />

        <Input
          label="Code"
          value={form.code}
          onChange={(e) =>
            setForm((previousForm) => ({
              ...previousForm,
              code: e.target.value,
            }))
          }
          placeholder="ELECTRICAL_BR"
          required
        />

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Description
          </label>

          <textarea
            value={form.description ?? ""}
            onChange={(e) =>
              setForm((previousForm) => ({
                ...previousForm,
                description: e.target.value,
              }))
            }
            placeholder="Décrivez la formation ou l'autorisation..."
            className="min-h-[110px] w-full resize-y rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition placeholder:text-slate-300 focus:border-[#13234b]"
          />
        </div>

        <label className="flex items-center gap-3 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={Boolean(form.requiresExpiry)}
            onChange={(e) =>
              setForm((previousForm) => ({
                ...previousForm,
                requiresExpiry: e.target.checked,
                validityMonths: e.target.checked
                  ? previousForm.validityMonths
                  : undefined,
              }))
            }
            className="h-4 w-4 rounded border-slate-300"
          />

          <span>Cette certification exige une date d’expiration.</span>
        </label>

        {form.requiresExpiry && (
          <Input
            label="Durée de validité indicative (en mois)"
            type="number"
            min={1}
            value={form.validityMonths ?? ""}
            onChange={(e) =>
              setForm((previousForm) => ({
                ...previousForm,
                validityMonths: e.target.value
                  ? Number(e.target.value)
                  : undefined,
              }))
            }
            placeholder="36"
          />
        )}

        <div>
          <p className="mb-3 text-sm font-medium text-slate-700">
            Compétences associées
          </p>

          {activeSkills.length === 0 ? (
            <p className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">
              Aucune compétence active disponible.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {activeSkills.map((skill) => {
                const selected = form.skillIds?.includes(skill.id);

                return (
                  <button
                    key={skill.id}
                    type="button"
                    onClick={() => toggleSkill(skill.id)}
                    className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                      selected
                        ? "border-[#13234b] bg-[#13234b] text-white"
                        : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {skill.name}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-3">
          <Button
            type="submit"
            disabled={submitting}
            className="rounded-full px-5 py-3"
          >
            {submitting
              ? "Enregistrement..."
              : editingCertification
                ? "Enregistrer"
                : "Ajouter la certification"}
          </Button>

          {editingCertification && (
            <Button
              type="button"
              variant="secondary"
              onClick={onCancelEdit}
              className="rounded-full px-5 py-3"
            >
              Annuler
            </Button>
          )}
        </div>
      </form>
    </Card>
  );
};

const CertificationForm = (props: CertificationFormProps) => {
  const formKey = props.editingCertification
    ? `edit-certification-${props.editingCertification.id}`
    : "create-certification";

  return <CertificationFormContent key={formKey} {...props} />;
};

export default CertificationForm;