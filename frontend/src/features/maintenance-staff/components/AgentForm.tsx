import { useState } from "react";
import Button from "../../../shared/components/ui/Button";
import Card from "../../../shared/components/ui/Card";
import Input from "../../../shared/components/ui/Input";
import type {
  CreateAgentPayload,
  MaintenanceAgentProfile,
  MaintenanceSkill,
  MaintenanceTeam,
  UpdateAgentPayload,
} from "../types/maintenanceStaff.types";

const generatePassword = () => {
  return `Agent@${Math.floor(100000 + Math.random() * 900000)}`;
};

const getInitialAgentForm = (
  editingAgent?: MaintenanceAgentProfile | null
): CreateAgentPayload => {
  if (editingAgent) {
    return {
      firstName: editingAgent.user.firstName,
      lastName: editingAgent.user.lastName,
      email: editingAgent.user.email,
      phone: editingAgent.user.phone ?? "",
      password: "",
      teamId: editingAgent.teamId ?? undefined,
      employeeCode: editingAgent.employeeCode ?? "",
      level: editingAgent.level,
      shift: editingAgent.shift,
      availabilityStatus: editingAgent.availabilityStatus,
      mainSpecialty: editingAgent.mainSpecialty ?? "",
      canHandleCritical: editingAgent.canHandleCritical,
      maxActiveTickets: editingAgent.maxActiveTickets,
      skillIds: editingAgent.skills.map((item) => item.skillId),
    };
  }

  return {
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: generatePassword(),
    teamId: undefined,
    employeeCode: "",
    level: "JUNIOR",
    shift: "DAY",
    availabilityStatus: "AVAILABLE",
    mainSpecialty: "",
    canHandleCritical: false,
    maxActiveTickets: 5,
    skillIds: [],
  };
};

interface AgentFormProps {
  teams: MaintenanceTeam[];
  skills: MaintenanceSkill[];
  submitting?: boolean;
  editingAgent?: MaintenanceAgentProfile | null;
  onCreate?: (payload: CreateAgentPayload) => Promise<void> | void;
  onUpdate?: (id: number, payload: UpdateAgentPayload) => Promise<void> | void;
  onCancelEdit?: () => void;
}

const AgentForm = ({
  teams,
  skills,
  submitting = false,
  editingAgent,
  onCreate,
  onUpdate,
  onCancelEdit,
}: AgentFormProps) => {
  const [form, setForm] = useState(() => getInitialAgentForm(editingAgent));

  const handleGeneratePassword = () => {
    setForm((previous) => ({
      ...previous,
      password: generatePassword(),
    }));
  };

  const toggleSkill = (skillId: number) => {
    const currentSkillIds = form.skillIds ?? [];

    const nextSkillIds = currentSkillIds.includes(skillId)
      ? currentSkillIds.filter((id) => id !== skillId)
      : [...currentSkillIds, skillId];

    setForm({
      ...form,
      skillIds: nextSkillIds,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editingAgent && onUpdate) {
      await onUpdate(editingAgent.id, {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        phone: form.phone?.trim() || undefined,
        teamId: form.teamId ?? null,
        employeeCode: form.employeeCode?.trim() || undefined,
        level: form.level,
        shift: form.shift,
        availabilityStatus: form.availabilityStatus,
        mainSpecialty: form.mainSpecialty?.trim() || undefined,
        canHandleCritical: form.canHandleCritical,
        maxActiveTickets: Number(form.maxActiveTickets ?? 5),
        skillIds: form.skillIds ?? [],
      });

      return;
    }

    if (onCreate) {
      await onCreate({
        ...form,
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim().toLowerCase(),
        phone: form.phone?.trim() || undefined,
        employeeCode: form.employeeCode?.trim() || undefined,
        mainSpecialty: form.mainSpecialty?.trim() || undefined,
        maxActiveTickets: Number(form.maxActiveTickets ?? 5),
        skillIds: form.skillIds ?? [],
      });

      setForm(getInitialAgentForm(null));
    }
  };

  return (
    <Card className="p-6">
      <h2 className="text-2xl font-semibold text-[#13234b]">
        {editingAgent ? "Modifier l’agent" : "Créer un agent maintenance"}
      </h2>

      <p className="mt-2 text-sm text-slate-500">
        {editingAgent
          ? "Modifiez les informations techniques et organisationnelles de l’agent."
          : "L’agent pourra se connecter avec son email et son mot de passe initial."}
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-5">
        <div className="grid gap-4 md:grid-cols-2">
          <Input
            label="Prénom"
            value={form.firstName}
            onChange={(e) =>
              setForm({
                ...form,
                firstName: e.target.value,
              })
            }
            required
          />

          <Input
            label="Nom"
            value={form.lastName}
            onChange={(e) =>
              setForm({
                ...form,
                lastName: e.target.value,
              })
            }
            required
          />

          <Input
            label="Email / Username"
            type="email"
            value={form.email}
            onChange={(e) =>
              setForm({
                ...form,
                email: e.target.value,
              })
            }
            required
            disabled={Boolean(editingAgent)}
          />

          <Input
            label="Téléphone"
            value={form.phone}
            onChange={(e) =>
              setForm({
                ...form,
                phone: e.target.value,
              })
            }
          />

          {!editingAgent && (
            <div className="flex gap-3">
              <div className="flex-1">
                <Input
                  label="Mot de passe initial"
                  value={form.password}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      password: e.target.value,
                    })
                  }
                  required
                />
              </div>

              <div className="flex items-end">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleGeneratePassword}
                  className="h-[52px] rounded-2xl px-4"
                >
                  Générer
                </Button>
              </div>
            </div>
          )}

          <Input
            label="Code employé"
            value={form.employeeCode}
            onChange={(e) =>
              setForm({
                ...form,
                employeeCode: e.target.value,
              })
            }
            placeholder="AG-001"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Équipe
            </label>

            <select
              value={form.teamId ?? ""}
              onChange={(e) =>
                setForm({
                  ...form,
                  teamId: e.target.value ? Number(e.target.value) : undefined,
                })
              }
              className="h-[52px] w-full rounded-2xl border border-slate-200 px-4 outline-none transition focus:border-[#13234b]"
            >
              <option value="">Aucune équipe</option>

              {teams.map((team) => (
                <option key={team.id} value={team.id}>
                  {team.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Niveau
            </label>

            <select
              value={form.level}
              onChange={(e) =>
                setForm({
                  ...form,
                  level: e.target.value as CreateAgentPayload["level"],
                })
              }
              className="h-[52px] w-full rounded-2xl border border-slate-200 px-4 outline-none transition focus:border-[#13234b]"
            >
              <option value="JUNIOR">Junior</option>
              <option value="CONFIRMED">Confirmé</option>
              <option value="SENIOR">Senior</option>
              <option value="EXPERT">Expert</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Shift
            </label>

            <select
              value={form.shift}
              onChange={(e) =>
                setForm({
                  ...form,
                  shift: e.target.value as CreateAgentPayload["shift"],
                })
              }
              className="h-[52px] w-full rounded-2xl border border-slate-200 px-4 outline-none transition focus:border-[#13234b]"
            >
              <option value="DAY">Journée</option>
              <option value="MORNING">Matin</option>
              <option value="AFTERNOON">Après-midi</option>
              <option value="NIGHT">Nuit</option>
              <option value="ON_CALL">Astreinte</option>
            </select>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Disponibilité
            </label>

            <select
              value={form.availabilityStatus}
              onChange={(e) =>
                setForm({
                  ...form,
                  availabilityStatus: e.target.value,
                })
              }
              className="h-[52px] w-full rounded-2xl border border-slate-200 px-4 outline-none transition focus:border-[#13234b]"
            >
              <option value="AVAILABLE">Disponible</option>
              <option value="BUSY">Occupé</option>
              <option value="OFFLINE">Hors ligne</option>
              <option value="ON_LEAVE">En congé</option>
              <option value="ON_CALL">Astreinte</option>
            </select>
          </div>

          <Input
            label="Spécialité principale"
            value={form.mainSpecialty}
            onChange={(e) =>
              setForm({
                ...form,
                mainSpecialty: e.target.value,
              })
            }
            placeholder="Plomberie, électricité..."
          />

          <Input
            label="Max tickets actifs"
            type="number"
            min={1}
            value={form.maxActiveTickets}
            onChange={(e) =>
              setForm({
                ...form,
                maxActiveTickets: Number(e.target.value),
              })
            }
          />
        </div>

        <label className="flex items-center gap-3 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={Boolean(form.canHandleCritical)}
            onChange={(e) =>
              setForm({
                ...form,
                canHandleCritical: e.target.checked,
              })
            }
            className="h-4 w-4 rounded border-slate-300"
          />

          <span>Peut gérer les tickets critiques</span>
        </label>

        <div>
          <p className="mb-3 text-sm font-medium text-slate-700">
            Compétences
          </p>

          {skills.length === 0 ? (
            <p className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">
              Aucune compétence disponible. Créez d’abord une compétence.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {skills.map((skill) => {
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

        <div className="flex gap-3">
          <Button
            type="submit"
            disabled={submitting}
            className="rounded-full px-6 py-3"
          >
            {editingAgent ? "Enregistrer" : "Créer l’agent"}
          </Button>

          {editingAgent && (
            <Button
              type="button"
              variant="secondary"
              onClick={onCancelEdit}
              className="rounded-full px-6 py-3"
            >
              Annuler
            </Button>
          )}
        </div>
      </form>
    </Card>
  );
};

export default AgentForm;