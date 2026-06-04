import Button from "../../../shared/components/ui/Button";
import Card from "../../../shared/components/ui/Card";
import { useAuth } from "../../auth/contexts/useAuth";

const MaintenanceDashboardPage = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
            Opérations & Maintenance
          </p>
          <p>Bonjour, {user?.firstName}</p>
          <h1 className="mt-2 text-5xl font-semibold tracking-tight text-[#13234b]">
            Tableau de Bord
          </h1>
        </div>

        <div className="flex gap-3">
          <Button
            variant="secondary"
            className="rounded-full bg-white px-5 py-3 text-sm shadow-sm"
          >
            Filtres avancés
          </Button>
          <Button className="rounded-full px-5 py-3 text-sm">
            + Créer un ticket
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <Card className="p-5">
          <p className="text-sm uppercase tracking-[0.18em] text-slate-400">
            Total tickets
          </p>
          <p className="mt-4 text-4xl font-semibold text-[#13234b]">124</p>
          <p className="mt-3 text-sm text-emerald-600">+12% vs mois dernier</p>
        </Card>

        <Card className="border-b-4 border-red-500 bg-red-50 p-5">
          <p className="text-sm uppercase tracking-[0.18em] text-red-700">
            Critiques
          </p>
          <p className="mt-4 text-4xl font-semibold text-red-700">08</p>
          <p className="mt-3 text-sm text-red-600">Action immédiate</p>
        </Card>

        <Card className="border-b-4 border-amber-700 p-5">
          <p className="text-sm uppercase tracking-[0.18em] text-amber-700">
            En retard
          </p>
          <p className="mt-4 text-4xl font-semibold text-amber-800">14</p>
          <p className="mt-3 text-sm text-amber-700">Action requise</p>
        </Card>

        <Card className="p-5">
          <p className="text-sm uppercase tracking-[0.18em] text-slate-400">
            Hors service
          </p>
          <p className="mt-4 text-4xl font-semibold text-slate-900">03</p>
          <p className="mt-3 text-sm text-slate-500">Chambres impactées</p>
        </Card>

        <Card className="p-5">
          <p className="text-sm uppercase tracking-[0.18em] text-slate-400">
            Préventifs
          </p>
          <p className="mt-4 text-4xl font-semibold text-slate-900">22</p>
          <p className="mt-3 text-sm text-slate-500">Planifiés cette semaine</p>
        </Card>
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

          <div className="mt-10 space-y-4">
            {[
              { label: "Plomberie", value: 42, dot: "bg-[#13234b]" },
              { label: "Électricité", value: 28, dot: "bg-amber-800" },
              { label: "Mobilier", value: 15, dot: "bg-slate-400" },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`h-2.5 w-2.5 rounded-full ${item.dot}`} />
                  <span className="text-sm text-slate-600">{item.label}</span>
                </div>
                <span className="text-sm font-semibold text-slate-900">
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div>
        <h2 className="mb-5 text-3xl font-semibold text-[#13234b]">
          Gestion des interventions
        </h2>

        <div className="grid gap-6 xl:grid-cols-4">
          {[
            {
              title: "Nouveau",
              count: 4,
              accent: "border-l-4 border-blue-500",
              items: [
                {
                  label: "Fuite d'eau importante - Chambre 304",
                  time: "Il y a 15 min",
                  tag: "URGENT",
                },
                {
                  label: "Ampoule grillée - Couloir B",
                  time: "Il y a 1h",
                  tag: "NORMAL",
                },
              ],
            },
            {
              title: "Assigné",
              count: 2,
              accent: "border-l-4 border-amber-500",
              items: [
                {
                  label: "Climatisation bruyante - Suite 502",
                  time: "Jean Dupont",
                  tag: "HAUTE",
                },
              ],
            },
            {
              title: "En cours",
              count: 3,
              accent: "border-l-4 border-indigo-500",
              items: [
                {
                  label: "Réparation Ascenseur Service",
                  time: "65% complété",
                  tag: "ACTION",
                },
              ],
            },
            {
              title: "En attente",
              count: 1,
              accent: "border-l-4 border-slate-300",
              items: [
                {
                  label: "Poignée porte - Chambre 101",
                  time: "Attente livraison fournisseur",
                  tag: "PIÈCES",
                },
              ],
            },
          ].map((column) => (
            <Card key={column.title} className={`p-5 ${column.accent}`}>
              <div className="mb-5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold text-[#13234b]">
                    {column.title}
                  </h3>
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-500">
                    {column.count}
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                {column.items.map((item) => (
                  <div
                    key={item.label}
                    className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm"
                  >
                    <span className="inline-flex rounded-md bg-slate-100 px-2 py-1 text-[11px] font-semibold text-slate-600">
                      {item.tag}
                    </span>
                    <p className="mt-3 text-sm font-semibold text-slate-900">
                      {item.label}
                    </p>
                    <p className="mt-2 text-xs text-slate-500">{item.time}</p>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MaintenanceDashboardPage;