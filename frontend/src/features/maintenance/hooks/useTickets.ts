import { useCallback, useEffect, useMemo, useState } from "react";
import { ticketService } from "../api/ticket.service";
import type {
  MaintenanceTicket,
  TicketFilters,
} from "../types/maintenance.types";
import type { PaginatedResponse } from "../../../shared/types/api.types";

interface TicketsState {
  data: PaginatedResponse<MaintenanceTicket> | null;
  error: string;
  requestKey: string;
}

export const useTickets = (filters: TicketFilters) => {
  const requestKey = useMemo(() => JSON.stringify(filters), [filters]);

  const [state, setState] = useState<TicketsState>({
    data: null,
    error: "",
    requestKey: "",
  });

  const fetchTickets = useCallback(async () => {
    const result = await ticketService.list(filters);

    setState({
      data: result,
      error: "",
      requestKey,
    });
  }, [filters, requestKey]);

  useEffect(() => {
    let ignore = false;

    const run = async () => {
      try {
        const result = await ticketService.list(filters);

        if (!ignore) {
          setState({
            data: result,
            error: "",
            requestKey,
          });
        }
      } catch (err) {
        console.error(err);

        if (!ignore) {
          setState({
            data: null,
            error: "Impossible de charger les tickets",
            requestKey,
          });
        }
      }
    };

    void run();

    return () => {
      ignore = true;
    };
  }, [filters, requestKey]);

  return {
    data: state.data,
    loading: state.requestKey !== requestKey,
    error: state.error,
    refetch: fetchTickets,
  };
};