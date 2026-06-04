import Spinner from "../ui/Spinner";

interface LoadingStateProps {
  label?: string;
}

const LoadingState = ({ label = "Chargement..." }: LoadingStateProps) => {
  return (
    <div className="grid min-h-[240px] place-items-center">
      <div className="flex flex-col items-center gap-3 text-slate-500">
        <Spinner className="h-8 w-8" />
        <p className="text-sm">{label}</p>
      </div>
    </div>
  );
};

export default LoadingState;