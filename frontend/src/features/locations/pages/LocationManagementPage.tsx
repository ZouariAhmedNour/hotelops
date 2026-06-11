import { useCallback, useEffect, useMemo, useState } from "react";
import { Grid3X3, LayoutList, MapPinned, Plus, Search } from "lucide-react";

import Button from "../../../shared/components/ui/Button";
import Card from "../../../shared/components/ui/Card";
import Spinner from "../../../shared/components/ui/Spinner";
import EmptyState from "../../../shared/components/feedback/EmptyState";
import ErrorState from "../../../shared/components/feedback/ErrorState";

import {
  locationApi,
  type HotelLocation,
  type LocationPayload,
  type LocationType,
} from "../api/locationApi";
import { locationQrCodeApi } from "../../qr-codes/api/locationQrCodeApi";
import LocationCard from "../components/LocationCard";
import LocationFormModal from "../components/LocationFormModal";
import LocationVisualMap from "../components/LocationVisualMap";

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

const filters: { label: string; value: "ALL" | LocationType }[] = [
  { label: "Tous", value: "ALL" },
  { label: "Chambres", value: "ROOM" },
  { label: "Étages", value: "FLOOR" },
  { label: "Zones communes", value: "COMMON_AREA" },
  { label: "Services", value: "SERVICE_AREA" },
  { label: "Extérieur", value: "OUTDOOR" },
  { label: "Parking", value: "PARKING" },
];

const LocationManagementPage = () => {
  const [locations, setLocations] = useState<HotelLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"ALL" | LocationType>("ALL");
  const [viewMode, setViewMode] = useState<"cards" | "map">("map");

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] =
    useState<HotelLocation | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const data = await locationApi.getAll();
      setLocations(data);
      setError("");
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Impossible de charger les endroits."));
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

  const stats = useMemo(() => {
    return {
      total: locations.length,
      rooms: locations.filter((location) => location.type === "ROOM").length,
      common: locations.filter((location) => location.type === "COMMON_AREA")
        .length,
      withoutQr: locations.filter(
        (location) => !location.qrCodes?.some((qr) => qr.isActive)
      ).length,
    };
  }, [locations]);

  const filteredLocations = useMemo(() => {
    return locations.filter((location) => {
      const matchesType =
        typeFilter === "ALL" ? true : location.type === typeFilter;

      const value = `${location.name} ${location.code} ${location.type} ${
        location.zone ?? ""
      } ${location.floor ?? ""} ${location.roomNumber ?? ""}`.toLowerCase();

      return matchesType && value.includes(search.toLowerCase());
    });
  }, [locations, search, typeFilter]);

  const handleOpenCreate = () => {
    setSelectedLocation(null);
    setModalOpen(true);
  };

  const handleEdit = (location: HotelLocation) => {
    setSelectedLocation(location);
    setModalOpen(true);
  };

  const handleSubmit = async (payload: LocationPayload) => {
    try {
      if (selectedLocation) {
        await locationApi.update(selectedLocation.id, payload);
      } else {
        await locationApi.create(payload);
      }

      setModalOpen(false);
      setSelectedLocation(null);
      await fetchData();
    } catch (err: unknown) {
      alert(getErrorMessage(err, "Erreur lors de l’enregistrement."));
    }
  };

  const handleDelete = async (location: HotelLocation) => {
    const confirmed = confirm(
      `Supprimer "${location.name}" ? Cette action est impossible si des tickets ou QR codes existent.`
    );

    if (!confirmed) return;

    try {
      await locationApi.remove(location.id);
      await fetchData();
    } catch (err: unknown) {
      alert(getErrorMessage(err, "Impossible de supprimer cet endroit."));
    }
  };

  const handleGenerateQr = async (location: HotelLocation) => {
    try {
      const qrCode = await locationQrCodeApi.create({
        locationId: location.id,
        label: `QR - ${location.name}`,
      });

      await fetchData();

      alert(
        qrCode.alreadyExists
          ? "Un QR code actif existe déjà pour cet endroit."
          : "QR code généré avec succès."
      );
    } catch (err: unknown) {
      alert(getErrorMessage(err, "Impossible de générer le QR code."));
    }
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
        <div className="flex items-start gap-4">
  <div className="rounded-[24px] bg-[#13234b] p-4 text-white shadow-[0_18px_40px_rgba(19,35,75,0.22)]">
    <MapPinned size={30} />
  </div>

  <div>
    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
      Administration
    </p>

    <h1 className="mt-2 text-4xl font-semibold tracking-tight text-[#13234b]">
      Gestion des endroits
    </h1>

    <p className="mt-2 text-slate-500">
      Organise les chambres, étages, zones communes, espaces de service,
      parkings et espaces extérieurs de l’hôtel.
    </p>
  </div>
</div>

        <Button
          onClick={handleOpenCreate}
          className="rounded-full px-5 py-3"
        >
          <Plus size={18} />
          Ajouter un endroit
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card className="p-5">
          <p className="text-sm uppercase tracking-[0.18em] text-slate-400">
            Total endroits
          </p>
          <p className="mt-3 text-4xl font-semibold text-[#13234b]">
            {stats.total}
          </p>
        </Card>

        <Card className="p-5">
          <p className="text-sm uppercase tracking-[0.18em] text-slate-400">
            Chambres
          </p>
          <p className="mt-3 text-4xl font-semibold text-blue-700">
            {stats.rooms}
          </p>
        </Card>

        <Card className="p-5">
          <p className="text-sm uppercase tracking-[0.18em] text-slate-400">
            Zones communes
          </p>
          <p className="mt-3 text-4xl font-semibold text-violet-700">
            {stats.common}
          </p>
        </Card>

        <Card className="p-5">
          <p className="text-sm uppercase tracking-[0.18em] text-slate-400">
            Sans QR actif
          </p>
          <p className="mt-3 text-4xl font-semibold text-amber-700">
            {stats.withoutQr}
          </p>
        </Card>
      </div>

      <Card className="p-5">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="relative w-full xl:w-[380px]">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Rechercher chambre, cuisine, parking..."
              className="h-12 w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-4 text-sm outline-none transition focus:border-[#13234b]"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {filters.map((filter) => (
              <button
                key={filter.value}
                type="button"
                onClick={() => setTypeFilter(filter.value)}
                className={[
                  "rounded-full px-4 py-2 text-sm font-semibold transition",
                  typeFilter === filter.value
                    ? "bg-[#13234b] text-white"
                    : "bg-slate-100 text-slate-500 hover:bg-slate-200",
                ].join(" ")}
              >
                {filter.label}
              </button>
            ))}
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setViewMode("map")}
              className={[
                "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition",
                viewMode === "map"
                  ? "bg-[#13234b] text-white"
                  : "bg-slate-100 text-slate-500",
              ].join(" ")}
            >
              <Grid3X3 size={16} />
              Schéma
            </button>

            <button
              type="button"
              onClick={() => setViewMode("cards")}
              className={[
                "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition",
                viewMode === "cards"
                  ? "bg-[#13234b] text-white"
                  : "bg-slate-100 text-slate-500",
              ].join(" ")}
            >
              <LayoutList size={16} />
              Cartes
            </button>
          </div>
        </div>
      </Card>

      {filteredLocations.length === 0 ? (
        <EmptyState
          title="Aucun endroit"
          message="Ajoute une chambre, une zone commune ou un espace de service."
        />
      ) : viewMode === "map" ? (
        <LocationVisualMap
          locations={filteredLocations}
          onSelect={handleEdit}
        />
      ) : (
        <div className="grid gap-5 xl:grid-cols-2">
          {filteredLocations.map((location) => (
            <LocationCard
              key={location.id}
              location={location}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onGenerateQr={(value) => {
                void handleGenerateQr(value);
              }}
            />
          ))}
        </div>
      )}

      {modalOpen && (
  <LocationFormModal
    key={selectedLocation ? selectedLocation.id : "create-location"}
    location={selectedLocation}
    onClose={() => {
      setModalOpen(false);
      setSelectedLocation(null);
    }}
    onSubmit={handleSubmit}
  />
)}
    </div>
  );
};

export default LocationManagementPage;