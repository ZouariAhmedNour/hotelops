interface ErrorStateProps {
  title?: string;
  message?: string;
}

const ErrorState = ({
  title = "Une erreur est survenue",
  message = "Impossible de charger les données.",
}: ErrorStateProps) => {
  return (
    <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-red-700">
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-sm">{message}</p>
    </div>
  );
};

export default ErrorState;