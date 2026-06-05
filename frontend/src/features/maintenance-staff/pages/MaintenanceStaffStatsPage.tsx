import Card from "../../../shared/components/ui/Card";
import ErrorState from "../../../shared/components/feedback/ErrorState";
import LoadingState from "../../../shared/components/feedback/LoadingState";
import StaffStatsCards from "../components/StaffStatsCards";
import { useMaintenanceStaffData } from "../hooks/useMaintenanceStaffData";

const MaintenanceStaffStatsPage = () => {
  const { teams, skills, agents, loading, error } = useMaintenanceStaffData();

  if (loading) {
    return <LoadingState label="Chargement des statistiques..." />;
  }

  if (error) {
    return <ErrorState message={error} />;
  }

  const teamDistribution = teams.map((team) => ({
    name: team.name,
    count: agents.filter((agent) => agent.teamId === team.id).length,
  }));

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
          Maintenance Staff
        </p>

        <h1 className="mt-2 text-4xl font-semibold text-[#13234b]">
          Statistiques Maintenance Staff
        </h1>

        <p className="mt-2 text-slate-500">
          Vue synthétique des agents, équipes et compétences.
        </p>
      </div>

      <StaffStatsCards agents={agents} teams={teams} skills={skills} />

      <Card className="p-6">
        <h2 className="text-2xl font-semibold text-[#13234b]">
          Répartition par équipe
        </h2>

        <div className="mt-6 space-y-4">
          {teamDistribution.length === 0 ? (
            <p className="text-sm text-slate-500">Aucune équipe disponible.</p>
          ) : (
            teamDistribution.map((item) => (
              <div key={item.name}>
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="font-medium text-slate-700">{item.name}</span>
                  <span className="text-slate-500">{item.count} agent(s)</span>
                </div>

                <div className="h-3 rounded-full bg-slate-100">
                  <div
                    className="h-3 rounded-full bg-[#13234b]"
                    style={{
                      width:
                        agents.length > 0
                          ? `${Math.round((item.count / agents.length) * 100)}%`
                          : "0%",
                    }}
                  />
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
};

export default MaintenanceStaffStatsPage;