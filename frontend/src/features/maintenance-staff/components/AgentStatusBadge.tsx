interface AgentStatusBadgeProps {
  status: string;
}

const AgentStatusBadge = ({ status }: AgentStatusBadgeProps) => {
  const normalized = status.toUpperCase();

  const styles: Record<string, string> = {
    AVAILABLE: "bg-emerald-50 text-emerald-700",
    BUSY: "bg-amber-50 text-amber-700",
    OFFLINE: "bg-slate-100 text-slate-600",
    ON_LEAVE: "bg-blue-50 text-blue-700",
    ON_CALL: "bg-purple-50 text-purple-700",
  };

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-semibold ${
        styles[normalized] ?? "bg-slate-100 text-slate-600"
      }`}
    >
      {status}
    </span>
  );
};

export default AgentStatusBadge;