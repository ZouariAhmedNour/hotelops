import { useState } from "react";
import { Link } from "react-router-dom";

import Button from "../../../shared/components/ui/Button";
import LoadingState from "../../../shared/components/feedback/LoadingState";
import ErrorState from "../../../shared/components/feedback/ErrorState";
import EmptyState from "../../../shared/components/feedback/EmptyState";

import TicketTable from "../components/TicketTable";
import { useTickets } from "../hooks/useTickets";
import type { TicketFilters as TicketFiltersType } from "../types/maintenance.types";
import TicketFilters from "../components/TicketFilters";

const TicketListPage = () => {
  const [filters, setFilters] = useState<TicketFiltersType>({
    page: 1,
    limit: 20,
  });

  const { data, loading, error } = useTickets(filters);

  const handlePageChange = (page: number) => {
    setFilters((previous) => ({
      ...previous,
      page,
    }));
  };

  if (loading) return <LoadingState label="Chargement des tickets..." />;

  if (error) {
    return <ErrorState message={error} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
            Maintenance
          </p>

          <h1 className="mt-2 text-4xl font-semibold text-[#13234b]">
            Tickets de maintenance
          </h1>
        </div>

        <Link to="/tickets/new">
          <Button className="rounded-full px-5 py-3">+ Nouveau ticket</Button>
        </Link>
      </div>

      <TicketFilters filters={filters} onChange={setFilters} />

      {!data || data.data.length === 0 ? (
        <EmptyState
          title="Aucun ticket trouvé"
          message="Aucun ticket ne correspond aux critères actuels."
        />
      ) : (
        <TicketTable tickets={data.data} />
      )}

      {data && data.pagination.totalPages > 1 && (
        <div className="flex justify-center gap-2">
          {Array.from(
            { length: data.pagination.totalPages },
            (_, index) => index + 1
          ).map((page) => (
            <button
              key={page}
              onClick={() => handlePageChange(page)}
              className={`rounded-lg px-3 py-1 text-sm ${
                page === data.pagination.page
                  ? "bg-[#13234b] text-white"
                  : "border border-slate-200 bg-white hover:bg-slate-50"
              }`}
            >
              {page}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default TicketListPage;