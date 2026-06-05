import Card from "../../../shared/components/ui/Card";
import type {
  MaintenanceAgentProfile,
  MaintenanceSkill,
  MaintenanceTeam,
} from "../types/maintenanceStaff.types";

interface StaffStatsCardsProps {
  agents: MaintenanceAgentProfile[];
  teams: MaintenanceTeam[];
  skills: MaintenanceSkill[];
}

const StaffStatsCards = ({ agents, teams, skills }: StaffStatsCardsProps) => {
  const available = agents.filter(
    (agent) => agent.availabilityStatus === "AVAILABLE"
  ).length;

  const busy = agents.filter((agent) => agent.availabilityStatus === "BUSY").length;

  const offline = agents.filter(
    (agent) =>
      agent.availabilityStatus === "OFFLINE" ||
      agent.availabilityStatus === "ON_LEAVE"
  ).length;

  const activeTeams = teams.filter((team) => team.isActive).length;
  const activeSkills = skills.filter((skill) => skill.isActive).length;

  const cards = [
    { label: "Total agents", value: agents.length },
    { label: "Disponibles", value: available },
    { label: "Occupés", value: busy },
    { label: "Hors ligne", value: offline },
    { label: "Équipes actives", value: activeTeams },
    { label: "Compétences actives", value: activeSkills },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
      {cards.map((card) => (
        <Card key={card.label} className="p-5">
          <p className="text-sm uppercase tracking-[0.18em] text-slate-400">
            {card.label}
          </p>

          <p className="mt-3 text-3xl font-semibold text-[#13234b]">
            {card.value}
          </p>
        </Card>
      ))}
    </div>
  );
};

export default StaffStatsCards;