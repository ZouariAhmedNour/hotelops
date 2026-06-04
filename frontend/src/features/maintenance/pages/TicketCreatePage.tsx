import { useState } from "react";
import { useNavigate } from "react-router-dom";

import TicketForm from "../components/TicketForm";
import { ticketService } from "../api/ticket.service";
import type { CreateTicketPayload } from "../types/maintenance.types";
import { ROUTES } from "../../../shared/config/routes";

const TicketCreatePage = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (values: CreateTicketPayload) => {
    try {
      setLoading(true);
      setError("");

      await ticketService.create(values);

      navigate(ROUTES.TICKETS);
    } catch (err) {
      console.error(err);
      setError("Impossible de créer le ticket");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
          Maintenance
        </p>

        <h1 className="mt-2 text-4xl font-semibold text-[#13234b]">
          Créer un ticket
        </h1>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <TicketForm loading={loading} onSubmit={handleSubmit} />
    </div>
  );
};

export default TicketCreatePage;