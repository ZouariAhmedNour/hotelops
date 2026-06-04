interface BadgeProps {
  label: string;
  color?: string;
  className?: string;
}

const Badge = ({ label, color = "#e5e7eb", className = "" }: BadgeProps) => {
  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${className}`}
      style={{ backgroundColor: color }}
    >
      {label}
    </span>
  );
};

export default Badge;