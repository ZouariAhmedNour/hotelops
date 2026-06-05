import { useCallback, useEffect, useState } from "react";

import Card from "../../../shared/components/ui/Card";
import Button from "../../../shared/components/ui/Button";
import Input from "../../../shared/components/ui/Input";
import LoadingState from "../../../shared/components/feedback/LoadingState";
import ErrorState from "../../../shared/components/feedback/ErrorState";

import { maintenanceStaffService } from "../api/maintenanceStaff.service";

import type {
  CreateAgentPayload,
  MaintenanceAgentProfile,
  MaintenanceSkill,
  MaintenanceTeam,
} from "../types/maintenanceStaff.types";

const generatePassword = () => {
  return `Agent@${Math.floor(100000 + Math.random() * 900000)}`;
};

const initialTeamForm = {
  name: "",
  code: "",
  description: "",
  color: "#13234b",
};

const initialSkillForm = {
  name: "",
  code: "",
};

const createInitialAgentForm = (): CreateAgentPayload => ({
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
});

const MaintenanceStaffPage = () => {
  const [teams, setTeams] = useState<MaintenanceTeam[]>([]);
  const [skills, setSkills] = useState<MaintenanceSkill[]>([]);
  const [agents, setAgents] = useState<MaintenanceAgentProfile[]>([]);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [teamForm, setTeamForm] = useState(initialTeamForm);
  const [skillForm, setSkillForm] = useState(initialSkillForm);
  const [agentForm, setAgentForm] = useState<CreateAgentPayload>(
    createInitialAgentForm()
  );

  const fetchData = useCallback(async (showLoader = false) => {
    try {
      if (showLoader) {
        setLoading(true);
      }

      setError("");

      const [teamsData, skillsData, agentsData] = await Promise.all([
        maintenanceStaffService.listTeams(),
        maintenanceStaffService.listSkills(),
        maintenanceStaffService.listAgents(),
      ]);

      setTeams(teamsData);
      setSkills(skillsData);
      setAgents(agentsData);
    } catch (err) {
      console.error(err);
      setError("Impossible de charger les données des équipes et agents.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let ignore = false;

    const run = async () => {
      try {
        const [teamsData, skillsData, agentsData] = await Promise.all([
          maintenanceStaffService.listTeams(),
          maintenanceStaffService.listSkills(),
          maintenanceStaffService.listAgents(),
        ]);

        if (!ignore) {
          setTeams(teamsData);
          setSkills(skillsData);
          setAgents(agentsData);
          setError("");
          setLoading(false);
        }
      } catch (err) {
        console.error(err);

        if (!ignore) {
          setError("Impossible de charger les données des équipes et agents.");
          setLoading(false);
        }
      }
    };

    void run();

    return () => {
      ignore = true;
    };
  }, []);

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setSubmitting(true);
      setError("");
      setSuccessMessage("");

      await maintenanceStaffService.createTeam({
        name: teamForm.name.trim(),
        code: teamForm.code.trim().toUpperCase(),
        description: teamForm.description.trim() || undefined,
        color: teamForm.color || undefined,
      });

      setTeamForm(initialTeamForm);
      setSuccessMessage("Équipe créée avec succès.");

      await fetchData();
    } catch (err) {
      console.error(err);
      setError("Impossible de créer l’équipe.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateSkill = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setSubmitting(true);
      setError("");
      setSuccessMessage("");

      await maintenanceStaffService.createSkill({
        name: skillForm.name.trim(),
        code: skillForm.code.trim().toUpperCase(),
      });

      setSkillForm(initialSkillForm);
      setSuccessMessage("Compétence créée avec succès.");

      await fetchData();
    } catch (err) {
      console.error(err);
      setError("Impossible de créer la compétence.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateAgent = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setSubmitting(true);
      setError("");
      setSuccessMessage("");

      await maintenanceStaffService.createAgent({
        ...agentForm,
        firstName: agentForm.firstName.trim(),
        lastName: agentForm.lastName.trim(),
        email: agentForm.email.trim().toLowerCase(),
        phone: agentForm.phone?.trim() || undefined,
        password: agentForm.password,
        employeeCode: agentForm.employeeCode?.trim() || undefined,
        mainSpecialty: agentForm.mainSpecialty?.trim() || undefined,
        teamId: agentForm.teamId ? Number(agentForm.teamId) : undefined,
        maxActiveTickets: Number(agentForm.maxActiveTickets ?? 5),
        skillIds: agentForm.skillIds ?? [],
      });

      setAgentForm(createInitialAgentForm());
      setSuccessMessage("Agent créé avec succès.");

      await fetchData();
    } catch (err) {
      console.error(err);
      setError("Impossible de créer l’agent.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteTeam = async (id: number) => {
    const confirmed = window.confirm(
      "Voulez-vous vraiment supprimer cette équipe ?"
    );

    if (!confirmed) return;

    try {
      setSubmitting(true);
      setError("");
      setSuccessMessage("");

      await maintenanceStaffService.deleteTeam(id);
      setSuccessMessage("Équipe supprimée avec succès.");

      await fetchData();
    } catch (err) {
      console.error(err);
      setError(
        "Impossible de supprimer cette équipe. Vérifiez qu’elle ne contient aucun agent."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteSkill = async (id: number) => {
    const confirmed = window.confirm(
      "Voulez-vous vraiment supprimer cette compétence ?"
    );

    if (!confirmed) return;

    try {
      setSubmitting(true);
      setError("");
      setSuccessMessage("");

      await maintenanceStaffService.deleteSkill(id);
      setSuccessMessage("Compétence supprimée avec succès.");

      await fetchData();
    } catch (err) {
      console.error(err);
      setError("Impossible de supprimer cette compétence.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteAgent = async (id: number) => {
    const confirmed = window.confirm(
      "Voulez-vous vraiment désactiver cet agent ?"
    );

    if (!confirmed) return;

    try {
      setSubmitting(true);
      setError("");
      setSuccessMessage("");

      await maintenanceStaffService.deleteAgent(id);
      setSuccessMessage("Agent désactivé avec succès.");

      await fetchData();
    } catch (err) {
      console.error(err);
      setError("Impossible de désactiver cet agent.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleGeneratePassword = () => {
    setAgentForm((previous) => ({
      ...previous,
      password: generatePassword(),
    }));
  };

  const toggleSkill = (skillId: number) => {
    const currentSkillIds = agentForm.skillIds ?? [];

    const nextSkillIds = currentSkillIds.includes(skillId)
      ? currentSkillIds.filter((id) => id !== skillId)
      : [...currentSkillIds, skillId];

    setAgentForm({
      ...agentForm,
      skillIds: nextSkillIds,
    });
  };

  if (loading) {
    return <LoadingState label="Chargement des équipes et agents..." />;
  }

  if (error && teams.length === 0 && skills.length === 0 && agents.length === 0) {
    return <ErrorState message={error} />;
  }

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
          Administration
        </p>

        <h1 className="mt-2 text-4xl font-semibold text-[#13234b]">
          Gestion des équipes & agents
        </h1>

        <p className="mt-2 text-slate-500">
          Organisez les équipes techniques, les compétences et les comptes
          agents de maintenance.
        </p>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {successMessage && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {successMessage}
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="p-6">
          <h2 className="text-2xl font-semibold text-[#13234b]">
            Créer une équipe
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Exemple : Plomberie, Électricité, Climatisation, Menuiserie.
          </p>

          <form onSubmit={handleCreateTeam} className="mt-6 space-y-4">
            <Input
              label="Nom de l’équipe"
              value={teamForm.name}
              onChange={(e) =>
                setTeamForm({
                  ...teamForm,
                  name: e.target.value,
                })
              }
              placeholder="Plomberie"
              required
            />

            <Input
              label="Code"
              value={teamForm.code}
              onChange={(e) =>
                setTeamForm({
                  ...teamForm,
                  code: e.target.value,
                })
              }
              placeholder="PLOMBERIE"
              required
            />

            <Input
              label="Description"
              value={teamForm.description}
              onChange={(e) =>
                setTeamForm({
                  ...teamForm,
                  description: e.target.value,
                })
              }
              placeholder="Équipe responsable des incidents de plomberie"
            />

            <Input
              label="Couleur"
              type="color"
              value={teamForm.color}
              onChange={(e) =>
                setTeamForm({
                  ...teamForm,
                  color: e.target.value,
                })
              }
            />

            <Button
              type="submit"
              disabled={submitting}
              className="rounded-full px-5 py-3"
            >
              Ajouter l’équipe
            </Button>
          </form>
        </Card>

        <Card className="p-6">
          <h2 className="text-2xl font-semibold text-[#13234b]">
            Créer une compétence
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Les compétences permettent de mieux recommander les agents.
          </p>

          <form onSubmit={handleCreateSkill} className="mt-6 space-y-4">
            <Input
              label="Nom"
              value={skillForm.name}
              onChange={(e) =>
                setSkillForm({
                  ...skillForm,
                  name: e.target.value,
                })
              }
              placeholder="Électricité"
              required
            />

            <Input
              label="Code"
              value={skillForm.code}
              onChange={(e) =>
                setSkillForm({
                  ...skillForm,
                  code: e.target.value,
                })
              }
              placeholder="ELECTRICITE"
              required
            />

            <Button
              type="submit"
              disabled={submitting}
              className="rounded-full px-5 py-3"
            >
              Ajouter la compétence
            </Button>
          </form>
        </Card>
      </div>

      <Card className="p-6">
        <h2 className="text-2xl font-semibold text-[#13234b]">
          Créer un agent maintenance
        </h2>

        <p className="mt-2 text-sm text-slate-500">
          L’agent pourra se connecter avec son email et le mot de passe initial.
        </p>

        <form onSubmit={handleCreateAgent} className="mt-6 space-y-5">
          <div className="grid gap-4 md:grid-cols-2">
            <Input
              label="Prénom"
              value={agentForm.firstName}
              onChange={(e) =>
                setAgentForm({
                  ...agentForm,
                  firstName: e.target.value,
                })
              }
              required
            />

            <Input
              label="Nom"
              value={agentForm.lastName}
              onChange={(e) =>
                setAgentForm({
                  ...agentForm,
                  lastName: e.target.value,
                })
              }
              required
            />

            <Input
              label="Email / Username"
              type="email"
              value={agentForm.email}
              onChange={(e) =>
                setAgentForm({
                  ...agentForm,
                  email: e.target.value,
                })
              }
              required
            />

            <Input
              label="Téléphone"
              value={agentForm.phone}
              onChange={(e) =>
                setAgentForm({
                  ...agentForm,
                  phone: e.target.value,
                })
              }
            />

            <div className="flex gap-3">
              <div className="flex-1">
                <Input
                  label="Mot de passe initial"
                  value={agentForm.password}
                  onChange={(e) =>
                    setAgentForm({
                      ...agentForm,
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

            <Input
              label="Code employé"
              value={agentForm.employeeCode}
              onChange={(e) =>
                setAgentForm({
                  ...agentForm,
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
                value={agentForm.teamId ?? ""}
                onChange={(e) =>
                  setAgentForm({
                    ...agentForm,
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
                value={agentForm.level}
                onChange={(e) =>
                  setAgentForm({
                    ...agentForm,
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
                value={agentForm.shift}
                onChange={(e) =>
                  setAgentForm({
                    ...agentForm,
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

          <div className="grid gap-4 md:grid-cols-2">
            <Input
              label="Spécialité principale"
              value={agentForm.mainSpecialty}
              onChange={(e) =>
                setAgentForm({
                  ...agentForm,
                  mainSpecialty: e.target.value,
                })
              }
              placeholder="Plomberie, électricité, climatisation..."
            />

            <Input
              label="Nombre max de tickets actifs"
              type="number"
              min={1}
              value={agentForm.maxActiveTickets}
              onChange={(e) =>
                setAgentForm({
                  ...agentForm,
                  maxActiveTickets: Number(e.target.value),
                })
              }
            />
          </div>

          <label className="flex items-center gap-3 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={Boolean(agentForm.canHandleCritical)}
              onChange={(e) =>
                setAgentForm({
                  ...agentForm,
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
                  const selected = agentForm.skillIds?.includes(skill.id);

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

          <Button
            type="submit"
            disabled={submitting}
            className="rounded-full px-6 py-3"
          >
            Créer l’agent
          </Button>
        </form>
      </Card>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="p-6">
          <h2 className="text-2xl font-semibold text-[#13234b]">
            Équipes existantes
          </h2>

          <div className="mt-6 space-y-3">
            {teams.length === 0 ? (
              <p className="text-sm text-slate-500">
                Aucune équipe créée pour le moment.
              </p>
            ) : (
              teams.map((team) => (
                <div
                  key={team.id}
                  className="flex items-center justify-between rounded-2xl bg-slate-50 p-4"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: team.color ?? "#13234b" }}
                    />

                    <div>
                      <p className="font-semibold text-slate-900">
                        {team.name}
                      </p>

                      <p className="text-sm text-slate-500">
                        {team.code} • {team._count?.agents ?? 0} agent(s)
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDeleteTeam(team.id)}
                    disabled={submitting}
                    className="text-sm font-semibold text-red-600 hover:underline disabled:opacity-50"
                  >
                    Supprimer
                  </button>
                </div>
              ))
            )}
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-2xl font-semibold text-[#13234b]">
            Compétences existantes
          </h2>

          <div className="mt-6 space-y-3">
            {skills.length === 0 ? (
              <p className="text-sm text-slate-500">
                Aucune compétence créée pour le moment.
              </p>
            ) : (
              skills.map((skill) => (
                <div
                  key={skill.id}
                  className="flex items-center justify-between rounded-2xl bg-slate-50 p-4"
                >
                  <div>
                    <p className="font-semibold text-slate-900">
                      {skill.name}
                    </p>

                    <p className="text-sm text-slate-500">
                      {skill.code} • {skill._count?.agents ?? 0} agent(s)
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDeleteSkill(skill.id)}
                    disabled={submitting}
                    className="text-sm font-semibold text-red-600 hover:underline disabled:opacity-50"
                  >
                    Supprimer
                  </button>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <h2 className="text-2xl font-semibold text-[#13234b]">
          Agents maintenance
        </h2>

        <div className="mt-6 overflow-hidden rounded-2xl border border-slate-100">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">
                  Agent
                </th>

                <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">
                  Équipe
                </th>

                <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">
                  Compétences
                </th>

                <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">
                  Niveau
                </th>

                <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">
                  Shift
                </th>

                <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">
                  Statut
                </th>

                <th className="px-4 py-3 text-right text-sm font-medium text-slate-600">
                  Action
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {agents.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-8 text-center text-sm text-slate-500"
                  >
                    Aucun agent créé pour le moment.
                  </td>
                </tr>
              ) : (
                agents.map((agent) => (
                  <tr key={agent.id}>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-slate-900">
                        {agent.user.firstName} {agent.user.lastName}
                      </p>

                      <p className="text-sm text-slate-500">
                        {agent.user.email}
                      </p>

                      {agent.employeeCode && (
                        <p className="text-xs text-slate-400">
                          Code : {agent.employeeCode}
                        </p>
                      )}
                    </td>

                    <td className="px-4 py-3 text-sm">
                      {agent.team?.name ?? (
                        <span className="italic text-slate-400">Aucune</span>
                      )}
                    </td>

                    <td className="px-4 py-3">
                      {agent.skills.length === 0 ? (
                        <span className="text-sm italic text-slate-400">
                          Aucune
                        </span>
                      ) : (
                        <div className="flex flex-wrap gap-1">
                          {agent.skills.map((agentSkill) => (
                            <span
                              key={agentSkill.id}
                              className="rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600"
                            >
                              {agentSkill.skill.name}
                            </span>
                          ))}
                        </div>
                      )}
                    </td>

                    <td className="px-4 py-3 text-sm">{agent.level}</td>

                    <td className="px-4 py-3 text-sm">{agent.shift}</td>

                    <td className="px-4 py-3 text-sm">
                      <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                        {agent.availabilityStatus}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => handleDeleteAgent(agent.id)}
                        disabled={submitting}
                        className="text-sm font-semibold text-red-600 hover:underline disabled:opacity-50"
                      >
                        Désactiver
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default MaintenanceStaffPage;