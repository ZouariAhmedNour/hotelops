import Card from "../../../shared/components/ui/Card";

interface StatCardProps {
  label: string;
  value: string | number;
  helper?: string;
  variant?: "default" | "danger" | "warning" | "success";
}

const StatCard = ({
  label,
  value,
  helper,
  variant = "default",
}: StatCardProps) => {
  const variants = {
    default: "text-[#13234b]",
    danger: "text-red-600",
    warning: "text-amber-700",
    success: "text-emerald-600",
  };

  return (
    <Card className="p-5">
      <p className="text-sm uppercase tracking-[0.18em] text-slate-400">
        {label}
      </p>

      <p className={`mt-4 text-4xl font-semibold ${variants[variant]}`}>
        {value}
      </p>

      {helper && <p className="mt-3 text-sm text-slate-500">{helper}</p>}
    </Card>
  );
};

export default StatCard;