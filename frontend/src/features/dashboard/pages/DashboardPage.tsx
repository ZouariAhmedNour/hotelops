import Card from "../../../shared/components/ui/Card";
import Button from "../../../shared/components/ui/Button";
import { useAuth } from "../../auth/contexts/useAuth";
import MaintenanceDashboardPage from "./MaintenanceDashboardPage";

const DashboardPage = () => {
  const { user } = useAuth();
  const roleCode = user?.role?.code?.toUpperCase();

  if (roleCode === "CHEF_MAINT") {
    return <MaintenanceDashboardPage />;
  }
  if (roleCode === "RECEPTION") {
    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-4xl font-semibold tracking-tight text-[#13234b]">
              Bonjour, {user?.firstName}
            </h1>
            <p className="mt-2 text-lg text-slate-500">
              Hôtel des Lumières — Shift Matin • 08:30 — 16:30
            </p>
          </div>

          <div className="flex gap-3">
            <Button
              variant="secondary"
              className="rounded-full bg-white px-5 py-3 text-sm shadow-sm"
            >
              Actualiser
            </Button>

            <Button className="rounded-full px-5 py-3 text-sm">
              + Nouvel Incident
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
          <div className="space-y-6">
            <Card className="p-6">
              <div className="mb-6 flex items-center justify-between">
                <h3 className="text-2xl font-semibold text-slate-900">
                  État du Parc Immobilier
                </h3>
                <span className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-400">
                  Temps réel
                </span>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-[24px] border-l-4 border-emerald-500 bg-slate-50 p-5">
                  <p className="text-sm uppercase tracking-[0.2em] text-slate-400">
                    Libres
                  </p>
                  <p className="mt-2 text-4xl font-semibold text-slate-900">
                    42
                  </p>
                  <p className="mt-3 text-sm font-medium text-emerald-600">
                    68% du parc
                  </p>
                </div>

                <div className="rounded-[24px] border-l-4 border-slate-800 bg-slate-50 p-5">
                  <p className="text-sm uppercase tracking-[0.2em] text-slate-400">
                    Occupées
                  </p>
                  <p className="mt-2 text-4xl font-semibold text-slate-900">
                    18
                  </p>
                  <p className="mt-3 text-sm font-medium text-slate-500">
                    2 départs prévus
                  </p>
                </div>

                <div className="rounded-[24px] border-l-4 border-red-500 bg-slate-50 p-5">
                  <p className="text-sm uppercase tracking-[0.2em] text-slate-400">
                    H.S.
                  </p>
                  <p className="mt-2 text-4xl font-semibold text-red-600">04</p>
                  <p className="mt-3 text-sm font-medium text-red-600">
                    Maintenance critique
                  </p>
                </div>
              </div>
            </Card>

            <div className="grid gap-6 lg:grid-cols-2">
              <Card className="p-6">
                <div className="mb-6 flex items-center justify-between">
                  <h3 className="text-2xl font-semibold text-slate-900">
                    Incidents Ouverts
                  </h3>
                  <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-600">
                    URGENT
                  </span>
                </div>

                <div className="space-y-4">
                  <div className="rounded-2xl bg-rose-50 p-4">
                    <p className="text-base font-semibold text-slate-900">
                      Fuite d’eau - Ch. 402
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      Signalé il y a 12 min • Étage 4
                    </p>
                  </div>

                  <div className="rounded-2xl bg-slate-50 p-4">
                    <p className="text-base font-semibold text-slate-900">
                      Serrure défectueuse - Ch. 215
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      Signalé il y a 45 min • Étage 2
                    </p>
                  </div>
                </div>

                <button className="mt-8 w-full text-center text-sm font-semibold tracking-[0.22em] text-[#13234b]">
                  VOIR TOUS LES 12 TICKETS
                </button>
              </Card>

              <Card className="p-6">
                <div className="mb-6 flex items-center justify-between">
                  <h3 className="text-2xl font-semibold text-slate-900">
                    Staff en Service
                  </h3>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500">
                    EN LIGNE
                  </span>
                </div>

                <div className="space-y-4">
                  {[
                    {
                      name: "Julien Masson",
                      role: "Maintenance Senior",
                      status: "Occupé (Ch. 402)",
                      dot: "bg-emerald-500",
                    },
                    {
                      name: "Elena Rodriguez",
                      role: "Gouvernante Générale",
                      status: "Disponible",
                      dot: "bg-emerald-500",
                    },
                    {
                      name: "Karim Bensaid",
                      role: "Tech. Informatique",
                      status: "Pause déjeuner",
                      dot: "bg-amber-500",
                    },
                  ].map((member) => (
                    <div
                      key={member.name}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className="grid h-11 w-11 place-items-center rounded-full bg-slate-100 text-sm font-semibold text-[#13234b]">
                          {member.name
                            .split(" ")
                            .map((p) => p[0])
                            .join("")
                            .slice(0, 2)}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">
                            {member.name}
                          </p>
                          <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                            {member.role}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                        <span
                          className={`h-2.5 w-2.5 rounded-full ${member.dot}`}
                        />
                        {member.status}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>

          <div className="space-y-6 self-start h-fit">
            <Card className="!bg-[#13234b] !text-white p-6 shadow-[0_20px_50px_rgba(19,35,75,0.25)]">
              <h3 className="text-2xl font-semibold">Briefing du Jour</h3>

              <div className="mt-6 space-y-4">
                <div className="rounded-[24px] border border-white/10 bg-white/5 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/45">
                    Événement spécial
                  </p>
                  <p className="mt-2 text-lg font-semibold">
                    Séminaire “Innov Tech” • 14:00
                  </p>
                  <p className="mt-1 text-sm text-white/60">
                    45 participants en Salon Majestic
                  </p>
                </div>

                <div className="rounded-[24px] border border-white/10 bg-white/5 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/45">
                    Alerte VIP
                  </p>
                  <p className="mt-2 text-lg font-semibold">
                    Arrivée M. Durand (Suite 101)
                  </p>
                  <p className="mt-1 text-sm text-white/60">
                    Préparer accueil champagne
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-2xl font-semibold text-slate-900">
                Alertes Maintenance Critique
              </h3>

              <div className="mt-6 space-y-4">
                <div className="rounded-[24px] bg-rose-50 p-4">
                  <p className="text-lg font-semibold text-red-700">
                    Chaudière Centrale
                  </p>
                  <p className="mt-2 text-sm leading-6 text-red-700/80">
                    Pression anormale détectée par les capteurs. Intervention
                    requise avant 12:00.
                  </p>
                </div>

                <div className="rounded-[24px] bg-slate-100 p-4">
                  <p className="text-lg font-semibold text-slate-900">
                    Panne Bornes WiFi
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    Étage 2 : signal instable rapporté par 3 clients.
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6 text-center">
              <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-slate-100 text-3xl">
                📦
              </div>
              <h3 className="mt-6 text-2xl font-semibold text-slate-900">
                Stocks Critique
              </h3>
              <p className="mt-2 text-slate-500">
                8 articles demandent un réassort aujourd’hui.
              </p>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-3">
      <Card className="p-5">
        <h3 className="text-sm text-slate-500">Tickets</h3>
        <p className="mt-2 text-3xl font-bold text-slate-900">124</p>
      </Card>

      <Card className="p-5">
        <h3 className="text-sm text-slate-500">Critiques</h3>
        <p className="mt-2 text-3xl font-bold text-red-600">8</p>
      </Card>

      <Card className="p-5">
        <h3 className="text-sm text-slate-500">En retard</h3>
        <p className="mt-2 text-3xl font-bold text-orange-600">14</p>
      </Card>
    </div>
  );
};

export default DashboardPage;
