import { useEffect, useMemo, useState } from "react";
import { Check, PackageSearch, X } from "lucide-react";

import Button from "../../../shared/components/ui/Button";
import Input from "../../../shared/components/ui/Input";

import { assetApi } from "../../assets/api/assetApi";
import { AssetIcon } from "../../assets/utils/assetIcon";

import type { MaintenanceAsset } from "../../assets/types/asset.types";

import type {
  HotelLocation,
  LocationAssetPayload,
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

const buildInitialAssets = (
  location?: HotelLocation | null
): LocationAssetPayload[] => {
  return (location?.locationAssets ?? [])
    .filter((item) => item.isActive && item.asset.isActive)
    .map((item) => ({
      assetId: item.assetId,
      quantity: item.quantity ?? 1,
      label: item.label ?? undefined,
      notes: item.notes ?? undefined,
      isActive: true,
    }));
};

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
      assets: [],
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
    assets: buildInitialAssets(location),
  };
};

const LocationFormModal = ({ location, onClose, onSubmit }: Props) => {
  const [form, setForm] = useState<LocationPayload>(() =>
    buildInitialForm(location)
  );

  const [availableAssets, setAvailableAssets] = useState<MaintenanceAsset[]>(
    []
  );

  const [loadingAssets, setLoadingAssets] = useState(true);
  const [assetsError, setAssetsError] = useState("");
  const [assetSearch, setAssetSearch] = useState("");
  const [saving, setSaving] = useState(false);

  const selectedAssetIds = useMemo(() => {
    return new Set((form.assets ?? []).map((item) => item.assetId));
  }, [form.assets]);

  const filteredAssets = useMemo(() => {
    const search = assetSearch.trim().toLowerCase();

    return availableAssets.filter((asset) => {
      const value = `${asset.name} ${asset.code} ${asset.category ?? ""}`
        .toLowerCase()
        .trim();

      return value.includes(search);
    });
  }, [availableAssets, assetSearch]);

  useEffect(() => {
    let ignore = false;

    const loadAssets = async () => {
      try {
        setLoadingAssets(true);

        const data = await assetApi.getAll({
          isActive: true,
        });

        if (!ignore) {
          setAvailableAssets(data);
          setAssetsError("");
        }
      } catch {
        if (!ignore) {
          setAssetsError(
            "Impossible de charger les équipements disponibles."
          );
        }
      } finally {
        if (!ignore) {
          setLoadingAssets(false);
        }
      }
    };

    void loadAssets();

    return () => {
      ignore = true;
    };
  }, []);

  const updateField = <K extends keyof LocationPayload>(
    key: K,
    value: LocationPayload[K]
  ) => {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const toggleAsset = (assetId: number) => {
    setForm((current) => {
      const currentAssets = current.assets ?? [];

      const isSelected = currentAssets.some(
        (item) => item.assetId === assetId
      );

      const nextAssets = isSelected
        ? currentAssets.filter((item) => item.assetId !== assetId)
        : [
            ...currentAssets,
            {
              assetId,
              quantity: 1,
              isActive: true,
            },
          ];

      return {
        ...current,
        assets: nextAssets,
      };
    });
  };

  const updateLocationAsset = (
    assetId: number,
    patch: Partial<LocationAssetPayload>
  ) => {
    setForm((current) => ({
      ...current,
      assets: (current.assets ?? []).map((item) =>
        item.assetId === assetId
          ? {
              ...item,
              ...patch,
            }
          : item
      ),
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
        type: form.type,

        zone: form.zone?.trim() || undefined,
        floor: form.floor?.trim() || undefined,
        roomNumber: form.roomNumber?.trim() || undefined,
        description: form.description?.trim() || undefined,

        isActive: form.isActive ?? true,

        assets: (form.assets ?? []).map((asset) => ({
          assetId: asset.assetId,
          quantity: Number(asset.quantity) || 1,
          label: asset.label?.trim() || undefined,
          notes: asset.notes?.trim() || undefined,
          isActive: true,
        })),
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/50 p-4 sm:p-6">
      <div className="flex min-h-full items-start justify-center py-4 sm:py-8">
        <div className="w-full max-w-5xl rounded-[32px] bg-white p-6 shadow-2xl">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold text-[#13234b]">
                {location ? "Modifier l’endroit" : "Ajouter un endroit"}
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Créez une chambre, une zone commune, une cuisine, un parking ou
                tout autre espace de l’hôtel.
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="rounded-full bg-slate-100 p-2 text-slate-500 transition hover:bg-slate-200 disabled:opacity-50"
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
              onChange={(event) =>
                updateField("roomNumber", event.target.value)
              }
              placeholder="Ex : 203"
            />
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
              placeholder="Ex : Chambre située dans l’aile droite, proche de l’ascenseur..."
              className="min-h-[110px] w-full resize-none rounded-2xl border border-slate-200 bg-white p-4 text-sm outline-none transition focus:border-[#13234b]"
            />
          </div>

          <label className="mt-4 flex items-center gap-3 text-sm font-semibold text-slate-600">
            <input
              type="checkbox"
              checked={form.isActive ?? true}
              onChange={(event) =>
                updateField("isActive", event.target.checked)
              }
              className="h-4 w-4"
            />

            Endroit actif
          </label>

          <section className="mt-8 border-t border-slate-100 pt-7">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <div className="flex items-center gap-2 text-[#13234b]">
                  <PackageSearch size={21} />

                  <h3 className="text-xl font-semibold">
                    Équipements disponibles dans cet endroit
                  </h3>
                </div>

                <p className="mt-2 text-sm text-slate-500">
                  Cochez les équipements réellement présents. Ils pourront être
                  sélectionnés lors de la création d’un ticket.
                </p>
              </div>

              <div className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-600">
                {(form.assets ?? []).length} sélectionné(s)
              </div>
            </div>

            <div className="mt-5">
              <input
                value={assetSearch}
                onChange={(event) => setAssetSearch(event.target.value)}
                placeholder="Rechercher TV, climatisation, douche..."
                className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-[#13234b]"
              />
            </div>

            {loadingAssets && (
              <p className="mt-5 text-sm text-slate-500">
                Chargement des équipements...
              </p>
            )}

            {assetsError && (
              <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {assetsError}
              </div>
            )}

            {!loadingAssets &&
              !assetsError &&
              filteredAssets.length === 0 && (
                <div className="mt-5 rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">
                  Aucun équipement actif trouvé. Créez d’abord des équipements
                  dans Administration → Équipements.
                </div>
              )}

            {!loadingAssets &&
              !assetsError &&
              filteredAssets.length > 0 && (
                <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {filteredAssets.map((asset) => {
                    const selected = selectedAssetIds.has(asset.id);

                    return (
                      <button
                        key={asset.id}
                        type="button"
                        onClick={() => toggleAsset(asset.id)}
                        className={[
                          "relative rounded-2xl border p-4 text-left transition",
                          selected
                            ? "border-[#13234b] bg-slate-50 shadow-sm"
                            : "border-slate-200 bg-white hover:border-slate-300",
                        ].join(" ")}
                      >
                        {selected && (
                          <span className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full bg-[#13234b] text-white">
                            <Check size={14} />
                          </span>
                        )}

                        <div className="flex items-start gap-3">
                          <div className="rounded-xl bg-slate-100 p-2 text-[#13234b]">
                            <AssetIcon icon={asset.icon} size={20} />
                          </div>

                          <div className="min-w-0">
                            <p className="truncate font-semibold text-slate-900">
                              {asset.name}
                            </p>

                            <p className="mt-1 text-xs text-slate-500">
                              {asset.category || "Sans catégorie"} ·{" "}
                              {asset.code}
                            </p>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

            {(form.assets ?? []).length > 0 && (
              <div className="mt-7 border-t border-slate-100 pt-6">
                <h4 className="text-base font-semibold text-[#13234b]">
                  Détails des équipements sélectionnés
                </h4>

                <p className="mt-1 text-sm text-slate-500">
                  La quantité est obligatoire. Le libellé et les notes sont
                  optionnels.
                </p>

                <div className="mt-4 space-y-4">
                  {(form.assets ?? []).map((selectedAsset) => {
                    const asset = availableAssets.find(
                      (item) => item.id === selectedAsset.assetId
                    );

                    if (!asset) {
                      return null;
                    }

                    return (
                      <div
                        key={selectedAsset.assetId}
                        className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                      >
                        <div className="flex items-center gap-3">
                          <div className="rounded-xl bg-white p-2 text-[#13234b]">
                            <AssetIcon icon={asset.icon} size={19} />
                          </div>

                          <div>
                            <p className="font-semibold text-slate-900">
                              {asset.name}
                            </p>

                            <p className="text-xs text-slate-500">
                              {asset.code}
                            </p>
                          </div>
                        </div>

                        <div className="mt-4 grid gap-3 md:grid-cols-3">
                          <Input
                            label="Quantité"
                            type="number"
                            value={String(selectedAsset.quantity ?? 1)}
                            onChange={(event) =>
                              updateLocationAsset(asset.id, {
                                quantity: Math.max(
                                  1,
                                  Number(event.target.value) || 1
                                ),
                              })
                            }
                          />

                          <Input
                            label="Libellé spécifique"
                            value={selectedAsset.label ?? ""}
                            onChange={(event) =>
                              updateLocationAsset(asset.id, {
                                label: event.target.value,
                              })
                            }
                            placeholder="Ex : TV principale"
                          />

                          <Input
                            label="Notes"
                            value={selectedAsset.notes ?? ""}
                            onChange={(event) =>
                              updateLocationAsset(asset.id, {
                                notes: event.target.value,
                              })
                            }
                            placeholder="Ex : Mur gauche"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </section>

          <div className="mt-8 flex justify-end gap-3 border-t border-slate-100 pt-6">
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
              disabled={saving || loadingAssets}
              className="rounded-full px-5 py-3"
            >
              {saving ? "Enregistrement..." : "Enregistrer"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocationFormModal;