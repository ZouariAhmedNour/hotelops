import Card from "../../../shared/components/ui/Card";

const ReportsPage = () => {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
          Administration
        </p>

        <h1 className="mt-2 text-4xl font-semibold text-[#13234b]">
          Rapports
        </h1>

        <p className="mt-2 text-slate-500">
          Analyse des performances, incidents et coûts.
        </p>
      </div>

      <Card className="p-6">
        <div className="h-[340px] rounded-[28px] border border-dashed border-slate-200 bg-slate-50" />
      </Card>
    </div>
  );
};

export default ReportsPage;