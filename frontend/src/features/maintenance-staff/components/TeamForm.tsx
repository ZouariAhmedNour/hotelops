import { useState } from "react";
import Button from "../../../shared/components/ui/Button";
import Card from "../../../shared/components/ui/Card";
import Input from "../../../shared/components/ui/Input";
import type {
  CreateTeamPayload,
  MaintenanceTeam,
} from "../types/maintenanceStaff.types";

interface TeamFormProps {
  submitting?: boolean;
  editingTeam?: MaintenanceTeam | null;
  onSubmit: (payload: CreateTeamPayload) => Promise<void> | void;
  onCancelEdit?: () => void;
}

const getInitialForm = (editingTeam?: MaintenanceTeam | null) => {
  return {
    name: editingTeam?.name ?? "",
    code: editingTeam?.code ?? "",
    description: editingTeam?.description ?? "",
    color: editingTeam?.color ?? "#13234b",
  };
};

const TeamForm = ({
  submitting = false,
  editingTeam,
  onSubmit,
  onCancelEdit,
}: TeamFormProps) => {
  const [form, setForm] = useState(() => getInitialForm(editingTeam));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    await onSubmit({
      name: form.name.trim(),
      code: form.code.trim().toUpperCase(),
      description: form.description.trim() || undefined,
      color: form.color || undefined,
    });

    if (!editingTeam) {
      setForm(getInitialForm(null));
    }
  };

  return (
    <Card className="p-6">
      <h2 className="text-2xl font-semibold text-[#13234b]">
        {editingTeam ? "Modifier l’équipe" : "Créer une équipe"}
      </h2>

      <p className="mt-2 text-sm text-slate-500">
        Exemple : Plomberie, Électricité, Climatisation, Menuiserie.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <Input
          label="Nom de l’équipe"
          value={form.name}
          onChange={(e) =>
            setForm({
              ...form,
              name: e.target.value,
            })
          }
          placeholder="Plomberie"
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
          placeholder="PLOMBERIE"
          required
        />

        <Input
          label="Description"
          value={form.description}
          onChange={(e) =>
            setForm({
              ...form,
              description: e.target.value,
            })
          }
          placeholder="Équipe responsable des incidents de plomberie"
        />

        <Input
          label="Couleur"
          type="color"
          value={form.color}
          onChange={(e) =>
            setForm({
              ...form,
              color: e.target.value,
            })
          }
        />

        <div className="flex gap-3">
          <Button
            type="submit"
            disabled={submitting}
            className="rounded-full px-5 py-3"
          >
            {editingTeam ? "Enregistrer" : "Ajouter l’équipe"}
          </Button>

          {editingTeam && (
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

export default TeamForm;