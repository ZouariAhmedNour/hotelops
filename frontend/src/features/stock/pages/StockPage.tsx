import Card from "../../../shared/components/ui/Card";

const StockPage = () => {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
          Opérations
        </p>

        <h1 className="mt-2 text-4xl font-semibold text-[#13234b]">
          Stock & Achats
        </h1>

        <p className="mt-2 text-slate-500">
          Gestion des pièces, consommables et demandes d’achat.
        </p>
      </div>

      <Card className="p-6">
        <p className="text-slate-500">
          Module stock à connecter avec l’API prochainement.
        </p>
      </Card>
    </div>
  );
};

export default StockPage;