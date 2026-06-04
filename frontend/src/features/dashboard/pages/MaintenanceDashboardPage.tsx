import Button from "../../../shared/components/ui/Button";
import Card from "../../../shared/components/ui/Card";
import { useAuth } from "../../auth/contexts/useAuth";
import StatCard from "../components/StatCard";

const MaintenanceDashboardPage = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
            Opérations & Maintenance
          </p>

          <p className="mt-2 text-slate-500">Bonjour, {user?.firstName}</p>

          <h1 className="mt-2 text-5xl font-semibold tracking-tight text-[#13234b]">
            Tableau de Bord
          </h1>
        </div>

        <div className="flex gap-3">
          <Button variant="secondary" className="rounded-full px-5 py-3">
            Filtres avancés
          </Button>

          <Button className="rounded-full px-5 py-3">+ Créer un ticket</Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <StatCard label="Total tickets" value="124" helper="+12% vs mois dernier" />
        <StatCard label="Critiques" value="08" variant="danger" helper="Action immédiate" />
        <StatCard label="En retard" value="14" variant="warning" helper="Action requise" />
        <StatCard label="Hors service" value="03" helper="Chambres impactées" />
        <StatCard label="Préventifs" value="22" helper="Planifiés cette semaine" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-[#13234b]">
              Évolution hebdomadaire
            </h2>

            <span className="text-sm text-slate-400">7 derniers jours</span>
          </div>

          <div className="mt-10 h-[340px] rounded-[28px] border border-dashed border-slate-200 bg-slate-50/40" />
        </Card>

        <Card className="p-6">
          <h2 className="text-2xl font-semibold text-[#13234b]">
            Pannes par type
          </h2>

          <div className="mt-10 flex items-center justify-center">
            <div className="flex h-40 w-40 items-center justify-center rounded-full border-[14px] border-slate-200">
              <div className="text-center">
                <p className="text-3xl font-semibold text-[#13234b]">64%</p>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                  Technique
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <h2 className="mb-5 text-3xl font-semibold text-[#13234b]">
          Gestion des interventions
        </h2>

        <div className="grid gap-6 xl:grid-cols-4">
          {["Nouveau", "Assigné", "En cours", "En attente"].map((column) => (
            <div key={column} className="rounded-2xl bg-slate-50 p-4">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-semibold text-[#13234b]">{column}</h3>
                <span className="rounded-full bg-white px-2 py-0.5 text-xs text-slate-500">
                  2
                </span>
              </div>

              <div className="rounded-2xl border border-slate-100 bg-white p-4">
                <span className="rounded-md bg-slate-100 px-2 py-1 text-[11px] font-semibold text-slate-600">
                  URGENT
                </span>

                <p className="mt-3 text-sm font-semibold text-slate-900">
                  Fuite d'eau importante - Chambre 304
                </p>

                <p className="mt-2 text-xs text-slate-500">Il y a 15 min</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default MaintenanceDashboardPage;