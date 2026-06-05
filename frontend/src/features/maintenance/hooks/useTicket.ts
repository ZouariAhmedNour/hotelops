import { useCallback, useEffect, useState } from "react";
import { ticketService } from "../api/ticket.service";
import type { MaintenanceTicket } from "../types/maintenance.types";

interface TicketState {
  ticket: MaintenanceTicket | null;
  error: string;
  loadedId?: number;
}

export const useTicket = (id?: number) => {
  const [state, setState] = useState<TicketState>({
    ticket: null,
    error: "",
    loadedId: undefined,
  });

  const fetchTicket = useCallback(async () => {
    if (!id) return;

    const data = await ticketService.getById(id);

    setState({
      ticket: data,
      error: "",
      loadedId: id,
    });
  }, [id]);

  useEffect(() => {
    if (!id) return;

    let ignore = false;

    const run = async () => {
      try {
        const data = await ticketService.getById(id);

        if (!ignore) {
          setState({
            ticket: data,
            error: "",
            loadedId: id,
          });
        }
      } catch (err) {
        console.error(err);

        if (!ignore) {
          setState({
            ticket: null,
            error: "Impossible de charger le ticket",
            loadedId: id,
          });
        }
      }
    };

    void run();

    return () => {
      ignore = true;
    };
  }, [id]);

  return {
    ticket: state.ticket,
    loading: Boolean(id) && state.loadedId !== id,
    error: state.error,
    refetch: fetchTicket,
  };
};