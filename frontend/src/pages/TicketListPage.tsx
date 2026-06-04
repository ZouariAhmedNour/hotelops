import { useEffect, useState } from "react";
import type {
  MaintenanceTicket,
  PaginatedResponse,
  TicketFilters,
} from "../types";
import { ticketService } from "../features/maintenance/api/ticketService";
import { Link } from "react-router-dom";

const TicketListPage: React.FC = () => {
  const [result, setResult] =
    useState<PaginatedResponse<MaintenanceTicket> | null>(null);

  const [filters, setFilters] = useState<TicketFilters>({
    page: 1,
    limit: 20,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ✅ Fetch propre
  useEffect(() => {
    const fetchTickets = async () => {
      setLoading(true);
      setError("");

      try {
        const data = await ticketService.list(filters);
        setResult(data);
      } catch (err) {
        console.error(err);
        setError("Impossible de charger les tickets");
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, [filters]);

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  if (loading) return <div className="p-6">Chargement...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Tickets de maintenance</h1>

        <Link
          to="/tickets/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Nouveau ticket
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              {[
                "N°",
                "Titre",
                "Statut",
                "Priorité",
                "Assigné à",
                "Créé le",
              ].map((h) => (
                <th
                  key={h}
                  className="px-4 py-3 text-left text-sm font-medium text-gray-600"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {result?.data.map((ticket) => (
              <tr key={ticket.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm font-mono">
                  <Link
                    to={`/tickets/${ticket.id}`}
                    className="text-blue-600 hover:underline"
                  >
                    {ticket.ticketNumber}
                  </Link>
                </td>

                <td className="px-4 py-3 text-sm">{ticket.title}</td>

                <td className="px-4 py-3">
                  <span
                    className="px-2 py-1 rounded text-xs font-medium"
                    style={{
                      backgroundColor: ticket.status.color || "#e5e7eb",
                      color: "#1f2937",
                    }}
                  >
                    {ticket.status.name}
                  </span>
                </td>

                <td className="px-4 py-3 text-sm">
                  {ticket.priority.name}
                </td>

                <td className="px-4 py-3 text-sm">
                  {ticket.assignedTo ? (
                    `${ticket.assignedTo.firstName} ${ticket.assignedTo.lastName}`
                  ) : (
                    <span className="text-gray-400 italic">
                      Non assigné
                    </span>
                  )}
                </td>

                <td className="px-4 py-3 text-sm text-gray-500">
                  {new Date(ticket.createdAt).toLocaleDateString("fr-FR")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {result && result.pagination.totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          {Array.from(
            { length: result.pagination.totalPages },
            (_, i) => i + 1
          ).map((p) => (
            <button
              key={p}
              onClick={() => handlePageChange(p)}
              className={`px-3 py-1 rounded ${
                p === result.pagination.page
                  ? "bg-blue-600 text-white"
                  : "bg-white border hover:bg-gray-50"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default TicketListPage;