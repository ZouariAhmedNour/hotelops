interface Props {
  label: string;
  color?: string;
}

const Badge: React.FC<Props> = ({ label, color = "#e5e7eb" }) => {
  return (
    <span
      className="px-2 py-1 rounded text-xs font-medium"
      style={{ backgroundColor: color }}
    >
      {label}
    </span>
  );
};

export default Badge;