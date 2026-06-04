import Card from "../../../shared/components/ui/Card";

const HousekeepingPage = () => {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
          Opérations
        </p>

        <h1 className="mt-2 text-4xl font-semibold text-[#13234b]">
          Housekeeping
        </h1>

        <p className="mt-2 text-slate-500">
          Suivi des chambres, nettoyage et signalements.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-5">
          <p className="text-sm text-slate-500">À nettoyer</p>
          <p className="mt-2 text-3xl font-bold text-[#13234b]">18</p>
        </Card>

        <Card className="p-5">
          <p className="text-sm text-slate-500">Prêtes</p>
          <p className="mt-2 text-3xl font-bold text-emerald-600">42</p>
        </Card>

        <Card className="p-5">
          <p className="text-sm text-slate-500">Bloquées</p>
          <p className="mt-2 text-3xl font-bold text-red-600">04</p>
        </Card>
      </div>
    </div>
  );
};

export default HousekeepingPage;