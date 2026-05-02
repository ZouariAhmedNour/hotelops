import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ticketService } from "../services/ticketService";

const TicketCreatePage = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "",
    description: "",
    locationId: 1,
    categoryId: 1,
    priorityId: 1,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    await ticketService.create(form);
    navigate("/tickets");
  };

  return (
    <div className="max-w-xl">
      <h1 className="text-xl font-bold mb-4">Créer un ticket</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          placeholder="Titre"
          onChange={(e) =>
            setForm({ ...form, title: e.target.value })
          }
        />

        <textarea
          placeholder="Description"
          onChange={(e) =>
            setForm({ ...form, description: e.target.value })
          }
        />

        <button className="bg-blue-600 text-white px-4 py-2 rounded">
          Créer
        </button>
      </form>
    </div>
  );
};

export default TicketCreatePage;