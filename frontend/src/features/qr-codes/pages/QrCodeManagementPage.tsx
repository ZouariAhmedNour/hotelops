import { useCallback, useEffect, useMemo, useState } from "react";
import { Plus, QrCode, Search, X } from "lucide-react";

import Button from "../../../shared/components/ui/Button";
import Card from "../../../shared/components/ui/Card";
import Input from "../../../shared/components/ui/Input";
import Spinner from "../../../shared/components/ui/Spinner";
import EmptyState from "../../../shared/components/feedback/EmptyState";
import ErrorState from "../../../shared/components/feedback/ErrorState";

import {
  locationQrCodeApi,
  type LocationQrCode,
} from "../api/locationQrCodeApi";
import {
  locationSelectApi,
  type LocationOption,
} from "../api/locationSelectApi";
import QrCodeCard from "../components/QrCodeCard";

type ApiError = {
  response?: {
    data?: {
      message?: string;
    };
  };
};

const getErrorMessage = (err: unknown, fallback: string) => {
  const apiError = err as ApiError;
  return apiError.response?.data?.message || fallback;
};

const QrCodeManagementPage = () => {
  const [qrCodes, setQrCodes] = useState<LocationQrCode[]>([]);
  const [locations, setLocations] = useState<LocationOption[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [selectedLocationId, setSelectedLocationId] = useState("");
  const [label, setLabel] = useState("");

  const [selectedQrCode, setSelectedQrCode] = useState<LocationQrCode | null>(
    null
  );

  const [creating, setCreating] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [qrCodesData, locationsData] = await Promise.all([
        locationQrCodeApi.getAll(),
        locationSelectApi.getAll(),
      ]);

      setQrCodes(qrCodesData);
      setLocations(locationsData.filter((location) => location.isActive));
      setError("");
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Impossible de charger les codes QR."));
    } finally {
      setLoading(false);
    }
  }, []);

  const handleRefresh = async () => {
    setLoading(true);
    await fetchData();
  };

 useEffect(() => {
  const timer = window.setTimeout(() => {
    void fetchData();
  }, 0);

  return () => {
    window.clearTimeout(timer);
  };
}, [fetchData]);

  const filteredQrCodes = useMemo(() => {
    return qrCodes.filter((qrCode) => {
      const value = `${qrCode.location.name} ${qrCode.location.type} ${
        qrCode.location.code ?? ""
      } ${qrCode.url}`.toLowerCase();

      return value.includes(search.toLowerCase());
    });
  }, [qrCodes, search]);

  const handleCreate = async () => {
    if (!selectedLocationId) {
      alert("Choisis une localisation.");
      return;
    }

    try {
      setCreating(true);

      const qrCode = await locationQrCodeApi.create({
        locationId: Number(selectedLocationId),
        label: label || undefined,
      });

      setSelectedLocationId("");
      setLabel("");

      await fetchData();
      setSelectedQrCode(qrCode);
    } catch (err: unknown) {
      alert(
        getErrorMessage(err, "Erreur lors de la création du code QR.")
      );
    } finally {
      setCreating(false);
    }
  };

  const handleView = async (qrCode: LocationQrCode) => {
    try {
      const fullQrCode = await locationQrCodeApi.getById(qrCode.id);
      setSelectedQrCode(fullQrCode);
    } catch (err: unknown) {
      alert(
        getErrorMessage(err, "Impossible d’afficher ce code QR.")
      );
    }
  };

  const handleRegenerate = async (qrCode: LocationQrCode) => {
    const confirmed = confirm(
      "Régénérer ce QR code ? L’ancien QR ne fonctionnera plus."
    );

    if (!confirmed) return;

    try {
      const updated = await locationQrCodeApi.regenerate(qrCode.id);
      await fetchData();
      setSelectedQrCode(updated);
    } catch (err: unknown) {
      alert(
        getErrorMessage(err, "Erreur lors de la régénération du QR code.")
      );
    }
  };

  const handleToggle = async (qrCode: LocationQrCode) => {
    try {
      await locationQrCodeApi.toggleStatus(qrCode.id);
      await fetchData();
    } catch (err: unknown) {
      alert(
        getErrorMessage(err, "Erreur lors du changement de statut.")
      );
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (error) {
  return (
    <div className="space-y-4">
      <ErrorState title="Erreur" message={error} />

      <Button
        onClick={() => {
          void handleRefresh();
        }}
        className="rounded-full px-5 py-3"
      >
        Réessayer
      </Button>
    </div>
  );
}

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
            Administration
          </p>

          <h1 className="mt-2 text-4xl font-semibold tracking-tight text-[#13234b]">
            Gestion des codes QR
          </h1>

          <p className="mt-2 text-slate-500">
            Crée des QR codes pour les chambres, zones mixtes, cuisines,
            halls, piscines et autres localisations.
          </p>
        </div>

        <Button
          onClick={() => {
            void handleRefresh();
          }}
          className="rounded-full px-5 py-3"
        >
          Actualiser
        </Button>
      </div>

      <Card className="p-6">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-[#13234b] p-3 text-white">
            <QrCode size={24} />
          </div>

          <div>
            <h2 className="text-xl font-semibold text-[#13234b]">
              Créer un nouveau QR code
            </h2>
            <p className="text-sm text-slate-500">
              Un seul QR actif est créé par localisation.
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_1fr_auto]">
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-600">
              Localisation
            </label>

            <select
              value={selectedLocationId}
              onChange={(event) => setSelectedLocationId(event.target.value)}
              className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-[#13234b]"
            >
              <option value="">Choisir une localisation</option>

              {locations.map((location) => (
                <option key={location.id} value={location.id}>
                  {location.name} — {location.type}
                  {location.code ? ` — ${location.code}` : ""}
                </option>
              ))}
            </select>
          </div>

          <Input
            label="Libellé optionnel"
            placeholder="Ex : QR Chambre 203"
            value={label}
            onChange={(event) => setLabel(event.target.value)}
          />

          <div className="flex items-end">
            <Button
              onClick={() => {
                void handleCreate();
              }}
              disabled={creating}
              className="h-12 rounded-2xl px-5"
            >
              <Plus size={18} />
              {creating ? "Création..." : "Créer"}
            </Button>
          </div>
        </div>
      </Card>

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-[#13234b]">
            Codes QR existants
          </h2>
          <p className="text-sm text-slate-500">
            {filteredQrCodes.length} code(s) QR trouvé(s)
          </p>
        </div>

        <div className="relative w-full md:w-[360px]">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Rechercher chambre, zone, code..."
            className="h-12 w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-4 text-sm outline-none transition focus:border-[#13234b]"
          />
        </div>
      </div>

      {filteredQrCodes.length === 0 ? (
        <EmptyState
          title="Aucun code QR"
          message="Crée un premier code QR pour une chambre ou une zone de l’hôtel."
        />
      ) : (
        <div className="grid gap-5 xl:grid-cols-2">
          {filteredQrCodes.map((qrCode) => (
            <QrCodeCard
              key={qrCode.id}
              qrCode={qrCode}
              onView={(value) => {
                void handleView(value);
              }}
              onRegenerate={(value) => {
                void handleRegenerate(value);
              }}
              onToggle={(value) => {
                void handleToggle(value);
              }}
            />
          ))}
        </div>
      )}

      {selectedQrCode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
          <div className="w-full max-w-xl rounded-[32px] bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-semibold text-[#13234b]">
                  {selectedQrCode.location.name}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Imprime ce QR code et colle-le dans la localisation concernée.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedQrCode(null)}
                className="rounded-full bg-slate-100 p-2 text-slate-500 transition hover:bg-slate-200"
              >
                <X size={20} />
              </button>
            </div>

            <div className="mt-6 flex flex-col items-center rounded-[28px] border border-slate-100 bg-slate-50 p-6 print:border-0 print:bg-white">
              {selectedQrCode.qrImageDataUrl ? (
                <img
                  src={selectedQrCode.qrImageDataUrl}
                  alt="QR Code"
                  className="h-72 w-72 rounded-2xl bg-white object-contain p-3"
                />
              ) : (
                <div className="flex h-72 w-72 items-center justify-center rounded-2xl bg-white text-slate-400">
                  QR non chargé
                </div>
              )}

              <h3 className="mt-5 text-xl font-semibold text-[#13234b]">
                {selectedQrCode.location.name}
              </h3>

              <p className="mt-2 text-center text-sm text-slate-500">
                Scanner pour signaler une panne, un incident ou une urgence.
              </p>

              <p className="mt-4 break-all text-center text-xs text-slate-400">
                {selectedQrCode.url}
              </p>
            </div>

            <div className="mt-6 flex flex-wrap justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  void navigator.clipboard.writeText(selectedQrCode.url);
                }}
                className="rounded-full border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
              >
                Copier le lien
              </button>

              <Button onClick={handlePrint} className="rounded-full px-5 py-3">
                Imprimer
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QrCodeManagementPage;