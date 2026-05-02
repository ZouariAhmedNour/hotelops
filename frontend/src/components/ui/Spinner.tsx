interface SpinnerProps {
  className?: string;
}

const Spinner: React.FC<SpinnerProps> = ({ className = "" }) => {
  return (
    <div
      className={`h-5 w-5 animate-spin rounded-full border-2 border-slate-200 border-t-[#13234b] ${className}`}
      aria-label="Chargement"
    />
  );
};

export default Spinner;