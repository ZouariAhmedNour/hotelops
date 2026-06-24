import type { TicketFilters as TicketFiltersType } from "../types/maintenance.types";

interface TicketFiltersProps {
  filters: TicketFiltersType;
  onChange: (filters: TicketFiltersType) => void;
}

const TicketFilters = ({
  filters,
  onChange,
}: TicketFiltersProps) => {
  const updateFilters = (values: Partial<TicketFiltersType>) => {
    onChange({
      ...filters,
      ...values,
      page: 1,
    });
  };

  return (
    <div className="rounded-3xl bg-white p-4 shadow-[0_2px_20px_rgba(15,23,42,0.06)]">
      <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_220px_220px_auto]">
        <input
          type="text"
          value={filters.search ?? ""}
          onChange={(event) =>
            updateFilters({
              search: event.target.value,
            })
          }
          placeholder="Rechercher un ticket..."
          className="h-[48px] w-full rounded-2xl border border-slate-200 px-4 outline-none transition focus:border-[#13234b]"
        />

        <select
          value={filters.statusCode ?? ""}
          onChange={(event) =>
            updateFilters({
              statusCode: event.target.value || undefined,
            })
          }
          className="h-[48px] rounded-2xl border border-slate-200 bg-white px-4 outline-none transition focus:border-[#13234b]"
        >
          <option value="">Tous les statuts</option>
          <option value="NEW">Nouveau</option>
          <option value="OPEN">Ouvert</option>
          <option value="ASSIGNED">Assigné</option>
          <option value="IN_PROGRESS">En cours</option>
          <option value="PENDING">En attente</option>
          <option value="PARTIALLY_RESOLVED">
            Partiellement résolu
          </option>
          <option value="RESOLVED">Résolu</option>
          <option value="CLOSED">Fermé</option>
        </select>

        <select
          value={filters.reportedFrom ?? ""}
          onChange={(event) =>
            updateFilters({
              reportedFrom: event.target.value || undefined,
            })
          }
          className="h-[48px] rounded-2xl border border-slate-200 bg-white px-4 outline-none transition focus:border-[#13234b]"
        >
          <option value="">Toutes les origines</option>
          <option value="web">Dashboard web</option>
          <option value="mobile">Application mobile</option>
          <option value="reception">Réception</option>
          <option value="qr_public">QR public</option>
          <option value="agent_follow_up">Tickets de suivi agent</option>
        </select>

        <label className="flex h-[48px] cursor-pointer items-center gap-2 rounded-2xl border border-slate-200 px-4 text-sm font-medium text-slate-700">
          <input
            type="checkbox"
            checked={filters.unassignedOnly === true}
            onChange={(event) =>
              updateFilters({
                unassignedOnly: event.target.checked || undefined,
              })
            }
          />

          Non assignés
        </label>
      </div>
    </div>
  );
};

export default TicketFilters;