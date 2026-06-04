import { useEffect, useState } from "react";
import { ticketService } from "../api/ticket.service";
import type {
  MaintenanceTicket,
  TicketFilters,
} from "../types/maintenance.types";
import type { PaginatedResponse } from "../../../shared/types/api.types";

export const useTickets = (filters: TicketFilters) => {
  const [data, setData] =
    useState<PaginatedResponse<MaintenanceTicket> | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchTickets = async () => {
    try {
      setLoading(true);
      setError("");

      const result = await ticketService.list(filters);
      setData(result);
    } catch (err) {
      console.error(err);
      setError("Impossible de charger les tickets");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [JSON.stringify(filters)]);

  return {
    data,
    loading,
    error,
    refetch: fetchTickets,
  };
};