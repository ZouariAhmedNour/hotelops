import type { TicketFilters as TicketFiltersType } from "../types/maintenance.types";

interface TicketFiltersPanelProps {
  filters: TicketFiltersType;
  onChange: (filters: TicketFiltersType) => void;
}

const TicketFiltersPanel = ({ filters, onChange }: TicketFiltersPanelProps) => {
  return (
    <div className="rounded-3xl bg-white p-4 shadow-[0_2px_20px_rgba(15,23,42,0.06)]">
      <input
        type="text"
        value={filters.search ?? ""}
        onChange={(e) =>
          onChange({
            ...filters,
            search: e.target.value,
            page: 1,
          })
        }
        placeholder="Rechercher un ticket..."
        className="h-[48px] w-full rounded-2xl border border-slate-200 px-4 outline-none focus:border-[#13234b]"
      />
    </div>
  );
};

export default TicketFiltersPanel;