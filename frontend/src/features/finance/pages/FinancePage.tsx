import Card from "../../../shared/components/ui/Card";

const FinancePage = () => {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
          Administration
        </p>

        <h1 className="mt-2 text-4xl font-semibold text-[#13234b]">
          Finance
        </h1>

        <p className="mt-2 text-slate-500">
          Suivi des coûts, factures et dépenses opérationnelles.
        </p>
      </div>

      <Card className="p-6">
        <p className="text-slate-500">
          Module finance à développer selon les besoins métier.
        </p>
      </Card>
    </div>
  );
};

export default FinancePage;