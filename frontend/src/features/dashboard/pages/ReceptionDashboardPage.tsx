import Card from "../../../shared/components/ui/Card";
import Button from "../../../shared/components/ui/Button";
import { useAuth } from "../../auth/contexts/useAuth";

const ReceptionDashboardPage = () => {
  const { user } = useAuth();

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
          <Button variant="secondary" className="rounded-full px-5 py-3">
            Actualiser
          </Button>

          <Button className="rounded-full px-5 py-3">+ Nouvel Incident</Button>
        </div>
      </div>

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
            <p className="mt-2 text-4xl font-semibold text-slate-900">42</p>
            <p className="mt-3 text-sm font-medium text-emerald-600">
              68% du parc
            </p>
          </div>

          <div className="rounded-[24px] border-l-4 border-slate-800 bg-slate-50 p-5">
            <p className="text-sm uppercase tracking-[0.2em] text-slate-400">
              Occupées
            </p>
            <p className="mt-2 text-4xl font-semibold text-slate-900">18</p>
            <p className="mt-3 text-sm font-medium text-slate-500">
              2 départs prévus
            </p>
          </div>

          <div className="rounded-[24px] border-l-4 border-red-500 bg-slate-50 p-5">
            <p className="text-sm uppercase tracking-[0.2em] text-slate-400">
              Hors service
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
          <h3 className="text-2xl font-semibold text-slate-900">
            Incidents ouverts
          </h3>

          <div className="mt-6 space-y-4">
            <div className="rounded-2xl bg-rose-50 p-4">
              <p className="font-semibold text-slate-900">
                Fuite d’eau - Chambre 402
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Signalé il y a 12 min • Étage 4
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="font-semibold text-slate-900">
                Serrure défectueuse - Chambre 215
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Signalé il y a 45 min • Étage 2
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-2xl font-semibold text-slate-900">
            Briefing du jour
          </h3>

          <div className="mt-6 space-y-4">
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="font-semibold text-slate-900">
                Séminaire Innov Tech
              </p>
              <p className="mt-1 text-sm text-slate-500">
                45 participants en Salon Majestic à 14:00.
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="font-semibold text-slate-900">Arrivée VIP</p>
              <p className="mt-1 text-sm text-slate-500">
                Suite 101 à préparer avant 16:00.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ReceptionDashboardPage;