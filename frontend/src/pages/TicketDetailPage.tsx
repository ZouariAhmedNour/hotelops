import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { ticketService } from "../features/maintenance/api/ticketService";
import type { MaintenanceTicket } from "../types";

const TicketDetailPage = () => {
  const { id } = useParams();
  const [ticket, setTicket] = useState<MaintenanceTicket | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchTicket = async () => {
      if (!id) return;

      try {
        setLoading(true);
        setError("");
        const data = await ticketService.getById(Number(id));
        setTicket(data);
      } catch (err) {
        console.error(err);
        setError("Impossible de charger le ticket");
      } finally {
        setLoading(false);
      }
    };

    fetchTicket();
  }, [id]);

  if (loading) return <div className="p-6">Chargement...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;
  if (!ticket) return <div className="p-6">Ticket introuvable</div>;

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold">{ticket.title}</h1>
      <p className="mt-2 text-gray-600">{ticket.description}</p>
    </div>
  );
};

export default TicketDetailPage;