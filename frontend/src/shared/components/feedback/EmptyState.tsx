interface EmptyStateProps {
  title?: string;
  message?: string;
}

const EmptyState = ({
  title = "Aucune donnée",
  message = "Il n’y a rien à afficher pour le moment.",
}: EmptyStateProps) => {
  return (
    <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-8 text-center">
      <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
      <p className="mt-2 text-sm text-slate-500">{message}</p>
    </div>
  );
};

export default EmptyState;