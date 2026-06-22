import { useState } from "react";
import { X } from "lucide-react";

import Button from "../../../shared/components/ui/Button";
import Input from "../../../shared/components/ui/Input";

import { AssetIcon } from "../utils/assetIcon";

import type {
  AssetPayload,
  MaintenanceAsset,
} from "../types/asset.types";

interface Props {
  asset?: MaintenanceAsset | null;
  onClose: () => void;
  onSubmit: (payload: AssetPayload) => Promise<void>;
}

const ICON_OPTIONS = [
  { value: "Tv", label: "Télévision" },
  { value: "AirVent", label: "Climatisation" },
  { value: "Phone", label: "Téléphone" },
  { value: "LampDesk", label: "Lampe" },
  { value: "PlugZap", label: "Prise électrique" },
  { value: "KeyRound", label: "Serrure / clé" },
  { value: "ShowerHead", label: "Douche" },
  { value: "Droplets", label: "Eau / robinet" },
  { value: "Flame", label: "Chauffage / gaz" },
  { value: "Refrigerator", label: "Réfrigérateur" },
  { value: "CookingPot", label: "Cuisine" },
  { value: "Waves", label: "Piscine" },
  { value: "PanelTop", label: "Tableau électrique" },
  { value: "AlarmSmoke", label: "Détecteur incendie" },
  { value: "Cctv", label: "Caméra surveillance" },
  { value: "Router", label: "Routeur" },
  { value: "Wifi", label: "Wi-Fi" },
  { value: "ArrowUpDown", label: "Ascenseur" },
  { value: "WashingMachine", label: "Machine à laver" },
  { value: "PackageSearch", label: "Autre équipement" },
];

const buildInitialForm = (
  asset?: MaintenanceAsset | null
): AssetPayload => {
  if (!asset) {
    return {
      name: "",
      code: "",
      category: "",
      icon: "PackageSearch",
      description: "",
      isActive: true,
    };
  }

  return {
    name: asset.name,
    code: asset.code,
    category: asset.category ?? "",
    icon: asset.icon ?? "PackageSearch",
    description: asset.description ?? "",
    isActive: asset.isActive,
  };
};

const AssetFormModal = ({ asset, onClose, onSubmit }: Props) => {
  const [form, setForm] = useState<AssetPayload>(() =>
    buildInitialForm(asset)
  );

  const [saving, setSaving] = useState(false);

  const updateField = <K extends keyof AssetPayload>(
    key: K,
    value: AssetPayload[K]
  ) => {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.code.trim()) {
      alert("Le nom et le code sont obligatoires.");
      return;
    }

    try {
      setSaving(true);

      await onSubmit({
        name: form.name.trim(),
        code: form.code.trim().toUpperCase(),
        category: form.category?.trim() || undefined,
        icon: form.icon || undefined,
        description: form.description?.trim() || undefined,
        isActive: form.isActive ?? true,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4">
      <div className="my-8 w-full max-w-2xl rounded-[32px] bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
              Catalogue hôtel
            </p>

            <h2 className="mt-2 text-2xl font-semibold text-[#13234b]">
              {asset ? "Modifier l’équipement" : "Ajouter un équipement"}
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Créez un équipement qui pourra être associé à une ou plusieurs
              localisations.
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
            label="Nom de l’équipement"
            value={form.name}
            onChange={(event) => updateField("name", event.target.value)}
            placeholder="Ex : Climatisation"
          />

          <Input
            label="Code unique"
            value={form.code}
            onChange={(event) => updateField("code", event.target.value)}
            placeholder="Ex : AIR_CONDITIONER"
          />

          <Input
            label="Catégorie"
            value={form.category ?? ""}
            onChange={(event) => updateField("category", event.target.value)}
            placeholder="Ex : Chambre, Cuisine, Sécurité"
          />

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-600">
              Icône
            </label>

            <div className="flex gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-[#13234b]">
                <AssetIcon icon={form.icon} size={22} />
              </div>

              <select
                value={form.icon ?? "PackageSearch"}
                onChange={(event) => updateField("icon", event.target.value)}
                className="h-12 min-w-0 flex-1 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-[#13234b]"
              >
                {ICON_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="mt-4">
          <label className="mb-2 block text-sm font-semibold text-slate-600">
            Description
          </label>

          <textarea
            value={form.description ?? ""}
            onChange={(event) =>
              updateField("description", event.target.value)
            }
            placeholder="Ex : Unité de climatisation présente dans les chambres."
            className="min-h-[120px] w-full resize-none rounded-2xl border border-slate-200 bg-white p-4 text-sm outline-none transition focus:border-[#13234b]"
          />
        </div>

        <label className="mt-5 flex items-center gap-3 text-sm font-semibold text-slate-600">
          <input
            type="checkbox"
            checked={form.isActive ?? true}
            onChange={(event) => updateField("isActive", event.target.checked)}
            className="h-4 w-4"
          />

          Équipement actif et disponible pour les localisations
        </label>

        <div className="mt-7 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded-full border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
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
            {saving
              ? "Enregistrement..."
              : asset
                ? "Enregistrer"
                : "Créer l’équipement"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AssetFormModal;