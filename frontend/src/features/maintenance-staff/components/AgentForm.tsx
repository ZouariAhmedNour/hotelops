import { useMemo, useState } from "react";

import Button from "../../../shared/components/ui/Button";
import Card from "../../../shared/components/ui/Card";
import Input from "../../../shared/components/ui/Input";

import type {
  AgentCertificationPayload,
  AgentSkillPayload,
  CreateAgentPayload,
  MaintenanceAgentProfile,
  MaintenanceCertification,
  MaintenanceSkill,
  MaintenanceTeam,
  UpdateAgentPayload,
} from "../types/maintenanceStaff.types";

const generatePassword = () => {
  return `Agent@${Math.floor(100000 + Math.random() * 900000)}`;
};

const toDateInputValue = (value?: string | null) => {
  if (!value) {
    return "";
  }

  return value.slice(0, 10);
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

      skills: (editingAgent.skills ?? []).map((item) => ({
        skillId: item.skillId,
        level: item.level,
      })),

      certifications: (editingAgent.certifications ?? []).map((item) => ({
        certificationId: item.certificationId,
        issuedAt: toDateInputValue(item.issuedAt) || undefined,
        expiresAt: toDateInputValue(item.expiresAt) || undefined,
        provider: item.provider ?? "",
        certificateNumber: item.certificateNumber ?? "",
        status: item.status as AgentCertificationPayload["status"],
      })),
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

    skills: [],
    certifications: [],
  };
};

interface AgentFormProps {
  teams: MaintenanceTeam[];
  skills: MaintenanceSkill[];
  certifications: MaintenanceCertification[];

  submitting?: boolean;
  editingAgent?: MaintenanceAgentProfile | null;

  onCreate?: (payload: CreateAgentPayload) => Promise<void> | void;

  onUpdate?: (
    id: number,
    payload: UpdateAgentPayload
  ) => Promise<void> | void;

  onCancelEdit?: () => void;
}

const AgentForm = ({
  teams,
  skills,
  certifications,
  submitting = false,
  editingAgent,
  onCreate,
  onUpdate,
  onCancelEdit,
}: AgentFormProps) => {
  const [form, setForm] = useState<CreateAgentPayload>(() =>
    getInitialAgentForm(editingAgent)
  );

  const [formError, setFormError] = useState("");

  const activeSkills = useMemo(() => {
    return skills.filter((skill) => skill.isActive);
  }, [skills]);

  const selectedSkillIds = useMemo(() => {
    return (form.skills ?? []).map((item) => item.skillId);
  }, [form.skills]);

  const selectedCertificationIds = useMemo(() => {
    return (form.certifications ?? []).map((item) => item.certificationId);
  }, [form.certifications]);

  const compatibleCertifications = useMemo(() => {
    return certifications.filter((certification) => {
      if (!certification.isActive) {
        return false;
      }

      if (certification.skillLinks.length === 0) {
        return true;
      }

      return certification.skillLinks.some((link) =>
        selectedSkillIds.includes(link.skillId)
      );
    });
  }, [certifications, selectedSkillIds]);

  const handleGeneratePassword = () => {
    setForm((previous) => ({
      ...previous,
      password: generatePassword(),
    }));
  };

  const toggleSkill = (skillId: number) => {
    setForm((previous) => {
      const currentSkills = previous.skills ?? [];

      const alreadySelected = currentSkills.some(
        (item) => item.skillId === skillId
      );

      const nextSkills: AgentSkillPayload[] = alreadySelected
        ? currentSkills.filter((item) => item.skillId !== skillId)
        : [...currentSkills, { skillId, level: 1 }];

      const nextSkillIds = nextSkills.map((item) => item.skillId);

      const nextCertifications = (previous.certifications ?? []).filter(
        (agentCertification) => {
          const catalogCertification = certifications.find(
            (item) => item.id === agentCertification.certificationId
          );

          if (!catalogCertification) {
            return false;
          }

          if (catalogCertification.skillLinks.length === 0) {
            return true;
          }

          return catalogCertification.skillLinks.some((link) =>
            nextSkillIds.includes(link.skillId)
          );
        }
      );

      return {
        ...previous,
        skills: nextSkills,
        certifications: nextCertifications,
      };
    });
  };

  const updateSkillLevel = (skillId: number, level: number) => {
    setForm((previous) => ({
      ...previous,
      skills: (previous.skills ?? []).map((item) =>
        item.skillId === skillId
          ? {
              ...item,
              level,
            }
          : item
      ),
    }));
  };

  const toggleCertification = (certificationId: number) => {
    setForm((previous) => {
      const currentCertifications = previous.certifications ?? [];

      const alreadySelected = currentCertifications.some(
        (item) => item.certificationId === certificationId
      );

      if (alreadySelected) {
        return {
          ...previous,
          certifications: currentCertifications.filter(
            (item) => item.certificationId !== certificationId
          ),
        };
      }

      return {
        ...previous,
        certifications: [
          ...currentCertifications,
          {
            certificationId,
            status: "PENDING",
            provider: "",
            certificateNumber: "",
          },
        ],
      };
    });
  };

  const updateCertification = (
    certificationId: number,
    patch: Partial<AgentCertificationPayload>
  ) => {
    setForm((previous) => ({
      ...previous,
      certifications: (previous.certifications ?? []).map((item) =>
        item.certificationId === certificationId
          ? {
              ...item,
              ...patch,
            }
          : item
      ),
    }));
  };

  const getAgentCertification = (certificationId: number) => {
    return (form.certifications ?? []).find(
      (item) => item.certificationId === certificationId
    );
  };

  const validateForm = () => {
    for (const agentCertification of form.certifications ?? []) {
      const certification = certifications.find(
        (item) => item.id === agentCertification.certificationId
      );

      if (!certification) {
        return "Une certification sélectionnée est introuvable.";
      }

      if (
        certification.requiresExpiry &&
        agentCertification.status === "VALID" &&
        !agentCertification.expiresAt
      ) {
        return `La certification "${certification.name}" exige une date d’expiration.`;
      }

      if (
        agentCertification.issuedAt &&
        agentCertification.expiresAt &&
        agentCertification.expiresAt < agentCertification.issuedAt
      ) {
        return `La date d’expiration de "${certification.name}" doit être postérieure à la date d’obtention.`;
      }
    }

    return "";
  };

  const buildCertificationsPayload = (): AgentCertificationPayload[] => {
    return (form.certifications ?? []).map((item) => ({
      certificationId: item.certificationId,

      issuedAt: item.issuedAt || undefined,
      expiresAt: item.expiresAt || undefined,

      provider: item.provider?.trim() || undefined,
      certificateNumber: item.certificateNumber?.trim() || undefined,

      status: item.status ?? "PENDING",
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationError = validateForm();

    if (validationError) {
      setFormError(validationError);
      return;
    }

    setFormError("");

    const normalizedSkills = form.skills ?? [];
    const normalizedCertifications = buildCertificationsPayload();

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

        skills: normalizedSkills,
        certifications: normalizedCertifications,
      });

      return;
    }

    if (onCreate) {
      await onCreate({
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),

        email: form.email.trim().toLowerCase(),
        password: form.password,

        phone: form.phone?.trim() || undefined,

        teamId: form.teamId,
        employeeCode: form.employeeCode?.trim() || undefined,

        level: form.level,
        shift: form.shift,
        availabilityStatus: form.availabilityStatus,

        mainSpecialty: form.mainSpecialty?.trim() || undefined,

        canHandleCritical: form.canHandleCritical,
        maxActiveTickets: Number(form.maxActiveTickets ?? 5),

        skills: normalizedSkills,
        certifications: normalizedCertifications,
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
        Définissez le profil, les compétences et les certifications de sécurité.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-8">
        {formError && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {formError}
          </div>
        )}

        <section className="space-y-5">
          <h3 className="text-lg font-semibold text-[#13234b]">
            Informations personnelles
          </h3>

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
        </section>

        <section className="space-y-5 border-t border-slate-100 pt-8">
          <h3 className="text-lg font-semibold text-[#13234b]">
            Organisation et disponibilité
          </h3>

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
                    teamId: e.target.value
                      ? Number(e.target.value)
                      : undefined,
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

            <span>
              Autorisé à gérer les tickets critiques, sous réserve des
              certifications obligatoires.
            </span>
          </label>
        </section>

        <section className="space-y-5 border-t border-slate-100 pt-8">
          <div>
            <h3 className="text-lg font-semibold text-[#13234b]">
              Compétences techniques
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Attribuez un niveau technique de 1 à 5 pour chaque compétence.
            </p>
          </div>

          {activeSkills.length === 0 ? (
            <p className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">
              Aucune compétence disponible.
            </p>
          ) : (
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {activeSkills.map((skill) => {
                const selectedSkill = (form.skills ?? []).find(
                  (item) => item.skillId === skill.id
                );

                return (
                  <div
                    key={skill.id}
                    className={`rounded-2xl border p-4 ${
                      selectedSkill
                        ? "border-[#13234b] bg-slate-50"
                        : "border-slate-200 bg-white"
                    }`}
                  >
                    <label className="flex cursor-pointer items-start gap-3">
                      <input
                        type="checkbox"
                        checked={Boolean(selectedSkill)}
                        onChange={() => toggleSkill(skill.id)}
                        className="mt-1 h-4 w-4 rounded border-slate-300"
                      />

                      <span>
                        <span className="block font-semibold text-slate-900">
                          {skill.name}
                        </span>

                        <span className="mt-1 block text-xs text-slate-500">
                          {skill.code}
                        </span>
                      </span>
                    </label>

                    {selectedSkill && (
                      <div className="mt-4">
                        <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Niveau de maîtrise
                        </label>

                        <select
                          value={selectedSkill.level}
                          onChange={(e) =>
                            updateSkillLevel(skill.id, Number(e.target.value))
                          }
                          className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-[#13234b]"
                        >
                          <option value={1}>Niveau 1 — Débutant</option>
                          <option value={2}>Niveau 2 — Notions</option>
                          <option value={3}>Niveau 3 — Autonome</option>
                          <option value={4}>Niveau 4 — Avancé</option>
                          <option value={5}>Niveau 5 — Expert</option>
                        </select>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <section className="space-y-5 border-t border-slate-100 pt-8">
          <div>
            <h3 className="text-lg font-semibold text-[#13234b]">
              Certifications et formations
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Les certifications affichées dépendent des compétences choisies.
            </p>
          </div>

          {selectedSkillIds.length === 0 ? (
            <p className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700">
              Sélectionnez d’abord une compétence pour afficher les
              certifications correspondantes.
            </p>
          ) : compatibleCertifications.length === 0 ? (
            <p className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">
              Aucune certification liée aux compétences sélectionnées.
            </p>
          ) : (
            <div className="space-y-4">
              {compatibleCertifications.map((certification) => {
                const selected = selectedCertificationIds.includes(
                  certification.id
                );

                const agentCertification = getAgentCertification(
                  certification.id
                );

                const skillNames = certification.skillLinks
                  .map((link) => link.skill.name)
                  .join(", ");

                return (
                  <div
                    key={certification.id}
                    className={`rounded-2xl border p-5 ${
                      selected
                        ? "border-[#13234b] bg-slate-50"
                        : "border-slate-200 bg-white"
                    }`}
                  >
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                      <label className="flex cursor-pointer items-start gap-3">
                        <input
                          type="checkbox"
                          checked={selected}
                          onChange={() => toggleCertification(certification.id)}
                          className="mt-1 h-4 w-4 rounded border-slate-300"
                        />

                        <span>
                          <span className="block font-semibold text-slate-900">
                            {certification.name}
                          </span>

                          <span className="mt-1 block text-xs text-slate-500">
                            {certification.code}
                            {skillNames ? ` • ${skillNames}` : ""}
                          </span>
                        </span>
                      </label>

                      <span
                        className={`w-fit rounded-full px-3 py-1 text-xs font-semibold ${
                          certification.requiresExpiry
                            ? "bg-amber-50 text-amber-700"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {certification.requiresExpiry
                          ? `Expiration requise${
                              certification.validityMonths
                                ? ` (${certification.validityMonths} mois)`
                                : ""
                            }`
                          : "Sans expiration obligatoire"}
                      </span>
                    </div>

                    {selected && agentCertification && (
                      <div className="mt-5 grid gap-4 border-t border-slate-200 pt-5 md:grid-cols-2 xl:grid-cols-3">
                        <Input
                          label="Organisme / fournisseur"
                          value={agentCertification.provider ?? ""}
                          placeholder="Centre de formation..."
                          onChange={(e) =>
                            updateCertification(certification.id, {
                              provider: e.target.value,
                            })
                          }
                        />

                        <Input
                          label="Numéro du certificat"
                          value={agentCertification.certificateNumber ?? ""}
                          placeholder="CERT-2026-001"
                          onChange={(e) =>
                            updateCertification(certification.id, {
                              certificateNumber: e.target.value,
                            })
                          }
                        />

                        <div>
                          <label className="mb-2 block text-sm font-medium text-slate-700">
                            Statut
                          </label>

                          <select
                            value={agentCertification.status ?? "PENDING"}
                            onChange={(e) =>
                              updateCertification(certification.id, {
                                status: e.target
                                  .value as AgentCertificationPayload["status"],
                              })
                            }
                            className="h-[52px] w-full rounded-2xl border border-slate-200 bg-white px-4 outline-none transition focus:border-[#13234b]"
                          >
                            <option value="PENDING">En attente</option>
                            <option value="VALID">Valide</option>
                            <option value="EXPIRED">Expirée</option>
                            <option value="REVOKED">Révoquée</option>
                          </select>
                        </div>

                        <Input
                          label="Date d’obtention"
                          type="date"
                          value={agentCertification.issuedAt ?? ""}
                          onChange={(e) =>
                            updateCertification(certification.id, {
                              issuedAt: e.target.value || undefined,
                            })
                          }
                        />

                        <Input
                          label={
                            certification.requiresExpiry
                              ? "Date d’expiration *"
                              : "Date d’expiration"
                          }
                          type="date"
                          value={agentCertification.expiresAt ?? ""}
                          onChange={(e) =>
                            updateCertification(certification.id, {
                              expiresAt: e.target.value || undefined,
                            })
                          }
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <div className="flex flex-wrap gap-3 border-t border-slate-100 pt-6">
          <Button
            type="submit"
            disabled={submitting}
            className="rounded-full px-6 py-3"
          >
            {submitting
              ? "Enregistrement..."
              : editingAgent
                ? "Enregistrer les modifications"
                : "Créer l’agent"}
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