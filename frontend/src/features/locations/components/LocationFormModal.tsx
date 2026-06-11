import { X } from "lucide-react";
import { useState } from "react";

import Button from "../../../shared/components/ui/Button";
import Input from "../../../shared/components/ui/Input";

import type {
  HotelLocation,
  LocationPayload,
  LocationType,
} from "../api/locationApi";

interface Props {
  location?: HotelLocation | null;
  onClose: () => void;
  onSubmit: (payload: LocationPayload) => Promise<void>;
}

const LOCATION_TYPES: { value: LocationType; label: string }[] = [
  { value: "ROOM", label: "Chambre" },
  { value: "FLOOR", label: "Étage" },
  { value: "COMMON_AREA", label: "Zone commune" },
  { value: "SERVICE_AREA", label: "Zone service" },
  { value: "OUTDOOR", label: "Extérieur" },
  { value: "PARKING", label: "Parking" },
  { value: "OTHER", label: "Autre" },
];

const buildInitialForm = (
  location?: HotelLocation | null
): LocationPayload => {
  if (!location) {
    return {
      name: "",
      code: "",
      type: "ROOM",
      zone: "",
      floor: "",
      roomNumber: "",
      description: "",
      isActive: true,
    };
  }

  return {
    name: location.name,
    code: location.code,
    type: location.type,
    zone: location.zone ?? "",
    floor: location.floor ?? "",
    roomNumber: location.roomNumber ?? "",
    description: location.description ?? "",
    isActive: location.isActive,
  };
};

const LocationFormModal = ({ location, onClose, onSubmit }: Props) => {
  const [form, setForm] = useState<LocationPayload>(() =>
    buildInitialForm(location)
  );

  const [saving, setSaving] = useState(false);

  const updateField = <K extends keyof LocationPayload>(
    key: K,
    value: LocationPayload[K]
  ) => {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.code.trim()) {
      alert("Nom et code sont obligatoires.");
      return;
    }

    try {
      setSaving(true);

      await onSubmit({
        ...form,
        zone: form.zone || undefined,
        floor: form.floor || undefined,
        roomNumber: form.roomNumber || undefined,
        description: form.description || undefined,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
      <div className="w-full max-w-2xl rounded-[32px] bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-[#13234b]">
              {location ? "Modifier l’endroit" : "Ajouter un endroit"}
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Crée une chambre, une zone commune, un parking, une cuisine ou un
              autre espace.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-slate-100 p-2 text-slate-500 transition hover:bg-slate-200"
          >
            <X size={20} />
          </button>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <Input
            label="Nom"
            value={form.name}
            onChange={(event) => updateField("name", event.target.value)}
            placeholder="Ex : Chambre 203"
          />

          <Input
            label="Code unique"
            value={form.code}
            onChange={(event) => updateField("code", event.target.value)}
            placeholder="Ex : ROOM-203"
          />

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-600">
              Type
            </label>

            <select
              value={form.type}
              onChange={(event) =>
                updateField("type", event.target.value as LocationType)
              }
              className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-[#13234b]"
            >
              {LOCATION_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <Input
            label="Zone"
            value={form.zone ?? ""}
            onChange={(event) => updateField("zone", event.target.value)}
            placeholder="Ex : Hébergement, Service, Loisirs"
          />

          <Input
            label="Étage"
            value={form.floor ?? ""}
            onChange={(event) => updateField("floor", event.target.value)}
            placeholder="Ex : RDC, 1, 2, Extérieur"
          />

          <Input
            label="Numéro de chambre"
            value={form.roomNumber ?? ""}
            onChange={(event) => updateField("roomNumber", event.target.value)}
            placeholder="Ex : 203"
          />
        </div>

        <div className="mt-4">
          <label className="mb-2 block text-sm font-semibold text-slate-600">
            Description
          </label>

          <textarea
            value={form.description ?? ""}
            onChange={(event) => updateField("description", event.target.value)}
            placeholder="Ex : Chambre située dans l’aile droite, proche ascenseur..."
            className="min-h-[110px] w-full resize-none rounded-2xl border border-slate-200 bg-white p-4 text-sm outline-none transition focus:border-[#13234b]"
          />
        </div>

        <label className="mt-4 flex items-center gap-3 text-sm font-semibold text-slate-600">
          <input
            type="checkbox"
            checked={form.isActive ?? true}
            onChange={(event) => updateField("isActive", event.target.checked)}
            className="h-4 w-4"
          />
          Endroit actif
        </label>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
          >
            Annuler
          </button>

          <Button
            onClick={() => {
              void handleSubmit();
            }}
            disabled={saving}
            className="rounded-full px-5 py-3"
          >
            {saving ? "Enregistrement..." : "Enregistrer"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LocationFormModal;