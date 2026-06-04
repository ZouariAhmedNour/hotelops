import Card from "../../../shared/components/ui/Card";
import { useAuth } from "../../auth/contexts/useAuth";
import StatCard from "../components/StatCard";

const AgentDashboardPage = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
          Mes interventions
        </p>

        <h1 className="mt-2 text-5xl font-semibold tracking-tight text-[#13234b]">
          Bonjour, {user?.firstName}
        </h1>

        <p className="mt-2 text-lg text-slate-500">
          Voici les tickets qui vous sont assignés.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Assignés" value="7" helper="À traiter aujourd’hui" />
        <StatCard label="En cours" value="3" helper="Interventions actives" />
        <StatCard label="Terminés" value="12" variant="success" helper="Cette semaine" />
      </div>

      <Card className="p-6">
        <h2 className="text-2xl font-semibold text-[#13234b]">
          Tickets prioritaires
        </h2>

        <div className="mt-6 space-y-4">
          <div className="rounded-2xl bg-red-50 p-4">
            <p className="font-semibold text-red-700">
              Fuite d’eau - Chambre 402
            </p>

            <p className="mt-1 text-sm text-red-600">
              Priorité haute • Intervention immédiate
            </p>
          </div>

          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="font-semibold text-slate-900">
              Climatisation bruyante - Suite 502
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Assigné depuis 1h
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default AgentDashboardPage;