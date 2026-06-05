import Card from "../../../shared/components/ui/Card";
import type { MaintenanceTeam } from "../types/maintenanceStaff.types";

interface TeamListProps {
  teams: MaintenanceTeam[];
  submitting?: boolean;
  onEdit: (team: MaintenanceTeam) => void;
  onDelete: (id: number) => void;
}

const TeamList = ({ teams, submitting = false, onEdit, onDelete }: TeamListProps) => {
  return (
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
                  <p className="font-semibold text-slate-900">{team.name}</p>
                  <p className="text-sm text-slate-500">
                    {team.code} • {team._count?.agents ?? 0} agent(s)
                  </p>
                  {team.description && (
                    <p className="mt-1 text-xs text-slate-400">
                      {team.description}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => onEdit(team)}
                  disabled={submitting}
                  className="text-sm font-semibold text-[#13234b] hover:underline disabled:opacity-50"
                >
                  Modifier
                </button>

                <button
                  type="button"
                  onClick={() => onDelete(team.id)}
                  disabled={submitting}
                  className="text-sm font-semibold text-red-600 hover:underline disabled:opacity-50"
                >
                  Supprimer
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
};

export default TeamList;