import StatCard from "../components/StatCard";
import Card from "../../../shared/components/ui/Card";
import Button from "../../../shared/components/ui/Button";
import { useAuth } from "../../auth/contexts/useAuth";

const AdminDashboardPage = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
            Administration générale
          </p>

          <h1 className="mt-2 text-5xl font-semibold tracking-tight text-[#13234b]">
            Bonjour, {user?.firstName}
          </h1>

          <p className="mt-2 text-lg text-slate-500">
            Vue globale des opérations de l’hôtel.
          </p>
        </div>

        <Button className="rounded-full px-5 py-3">Actualiser</Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Tickets" value="124" helper="Tous modules" />
        <StatCard label="Critiques" value="8" variant="danger" helper="À traiter" />
        <StatCard label="Utilisateurs" value="36" helper="Comptes actifs" />
        <StatCard label="Rapports" value="12" helper="Ce mois-ci" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <Card className="p-6">
          <h2 className="text-2xl font-semibold text-[#13234b]">
            Activité opérationnelle
          </h2>

          <div className="mt-8 h-[320px] rounded-[28px] border border-dashed border-slate-200 bg-slate-50" />
        </Card>

        <Card className="p-6">
          <h2 className="text-2xl font-semibold text-[#13234b]">
            Alertes prioritaires
          </h2>

          <div className="mt-6 space-y-4">
            <div className="rounded-2xl bg-red-50 p-4">
              <p className="font-semibold text-red-700">Maintenance critique</p>
              <p className="mt-1 text-sm text-red-600">
                8 tickets nécessitent une action immédiate.
              </p>
            </div>

            <div className="rounded-2xl bg-amber-50 p-4">
              <p className="font-semibold text-amber-700">Stocks faibles</p>
              <p className="mt-1 text-sm text-amber-700">
                Certains articles doivent être réapprovisionnés.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboardPage;