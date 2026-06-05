import { useState } from "react";
import Button from "../../../shared/components/ui/Button";
import Card from "../../../shared/components/ui/Card";
import Input from "../../../shared/components/ui/Input";
import type {
  CreateSkillPayload,
  MaintenanceSkill,
} from "../types/maintenanceStaff.types";

interface SkillFormProps {
  submitting?: boolean;
  editingSkill?: MaintenanceSkill | null;
  onSubmit: (payload: CreateSkillPayload) => Promise<void> | void;
  onCancelEdit?: () => void;
}

const getInitialForm = (editingSkill?: MaintenanceSkill | null) => {
  return {
    name: editingSkill?.name ?? "",
    code: editingSkill?.code ?? "",
  };
};

const SkillForm = ({
  submitting = false,
  editingSkill,
  onSubmit,
  onCancelEdit,
}: SkillFormProps) => {
  const [form, setForm] = useState(() => getInitialForm(editingSkill));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    await onSubmit({
      name: form.name.trim(),
      code: form.code.trim().toUpperCase(),
    });

    if (!editingSkill) {
      setForm(getInitialForm(null));
    }
  };

  return (
    <Card className="p-6">
      <h2 className="text-2xl font-semibold text-[#13234b]">
        {editingSkill ? "Modifier la compétence" : "Créer une compétence"}
      </h2>

      <p className="mt-2 text-sm text-slate-500">
        Les compétences permettent de mieux recommander les agents.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <Input
          label="Nom"
          value={form.name}
          onChange={(e) =>
            setForm({
              ...form,
              name: e.target.value,
            })
          }
          placeholder="Électricité"
          required
        />

        <Input
          label="Code"
          value={form.code}
          onChange={(e) =>
            setForm({
              ...form,
              code: e.target.value,
            })
          }
          placeholder="ELECTRICITE"
          required
        />

        <div className="flex gap-3">
          <Button
            type="submit"
            disabled={submitting}
            className="rounded-full px-5 py-3"
          >
            {editingSkill ? "Enregistrer" : "Ajouter la compétence"}
          </Button>

          {editingSkill && (
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

export default SkillForm;