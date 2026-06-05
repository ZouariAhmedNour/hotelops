import Card from "../../../shared/components/ui/Card";
import type { MaintenanceSkill } from "../types/maintenanceStaff.types";

interface SkillListProps {
  skills: MaintenanceSkill[];
  submitting?: boolean;
  onEdit: (skill: MaintenanceSkill) => void;
  onDelete: (id: number) => void;
}

const SkillList = ({
  skills,
  submitting = false,
  onEdit,
  onDelete,
}: SkillListProps) => {
  return (
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
                <p className="font-semibold text-slate-900">{skill.name}</p>
                <p className="text-sm text-slate-500">
                  {skill.code} • {skill._count?.agents ?? 0} agent(s)
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => onEdit(skill)}
                  disabled={submitting}
                  className="text-sm font-semibold text-[#13234b] hover:underline disabled:opacity-50"
                >
                  Modifier
                </button>

                <button
                  type="button"
                  onClick={() => onDelete(skill.id)}
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

export default SkillList;