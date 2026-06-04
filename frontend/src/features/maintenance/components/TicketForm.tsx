import { useState } from "react";
import Button from "../../../shared/components/ui/Button";
import Input from "../../../shared/components/ui/Input";
import type { CreateTicketPayload } from "../types/maintenance.types";

interface TicketFormProps {
  initialValues?: Partial<CreateTicketPayload>;
  loading?: boolean;
  onSubmit: (values: CreateTicketPayload) => void | Promise<void>;
}

const TicketForm = ({
  initialValues,
  loading = false,
  onSubmit,
}: TicketFormProps) => {
  const [form, setForm] = useState<CreateTicketPayload>({
    title: initialValues?.title ?? "",
    description: initialValues?.description ?? "",
    locationId: initialValues?.locationId ?? 1,
    categoryId: initialValues?.categoryId ?? 1,
    priorityId: initialValues?.priorityId ?? 1,
    reportedFrom: "web",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(form);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5 rounded-3xl bg-white p-6 shadow-[0_2px_20px_rgba(15,23,42,0.06)]"
    >
      <Input
        label="Titre"
        value={form.title}
        onChange={(e) =>
          setForm({
            ...form,
            title: e.target.value,
          })
        }
        required
      />

      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700">
          Description
        </label>

        <textarea
          value={form.description}
          onChange={(e) =>
            setForm({
              ...form,
              description: e.target.value,
            })
          }
          className="min-h-[140px] w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-[#13234b]"
          required
        />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Input
          label="Location ID"
          type="number"
          value={form.locationId}
          onChange={(e) =>
            setForm({
              ...form,
              locationId: Number(e.target.value),
            })
          }
          required
        />

        <Input
          label="Category ID"
          type="number"
          value={form.categoryId}
          onChange={(e) =>
            setForm({
              ...form,
              categoryId: Number(e.target.value),
            })
          }
          required
        />

        <Input
          label="Priority ID"
          type="number"
          value={form.priorityId}
          onChange={(e) =>
            setForm({
              ...form,
              priorityId: Number(e.target.value),
            })
          }
          required
        />
      </div>

      <Button type="submit" disabled={loading} className="rounded-full px-6 py-3">
        {loading ? "Enregistrement..." : "Enregistrer"}
      </Button>
    </form>
  );
};

export default TicketForm;