import { useEffect, useState } from "react";
import { ticketService } from "../api/ticket.service";
import type { MaintenanceTicket } from "../types/maintenance.types";

export const useTicket = (id?: number) => {
  const [ticket, setTicket] = useState<MaintenanceTicket | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchTicket = async () => {
    if (!id) return;

    try {
      setLoading(true);
      setError("");

      const data = await ticketService.getById(id);
      setTicket(data);
    } catch (err) {
      console.error(err);
      setError("Impossible de charger le ticket");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTicket();
  }, [id]);

  return {
    ticket,
    loading,
    error,
    refetch: fetchTicket,
  };
};