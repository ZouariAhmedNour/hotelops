import { useCallback, useEffect, useMemo, useState } from "react";
import { PackageSearch, Plus, Search } from "lucide-react";

import Button from "../../../shared/components/ui/Button";
import Card from "../../../shared/components/ui/Card";
import Spinner from "../../../shared/components/ui/Spinner";
import EmptyState from "../../../shared/components/feedback/EmptyState";
import ErrorState from "../../../shared/components/feedback/ErrorState";

import { assetApi } from "../api/assetApi";

import AssetCard from "../components/AssetCard";
import AssetFormModal from "../components/AssetFormModal";

import type {
  AssetPayload,
  MaintenanceAsset,
} from "../types/asset.types";

type ApiError = {
  response?: {
    data?: {
      message?: string;
    };
  };
};

type StatusFilter = "ALL" | "ACTIVE" | "INACTIVE";

const getErrorMessage = (error: unknown, fallback: string) => {
  const apiError = error as ApiError;

  return apiError.response?.data?.message || fallback;
};

const AssetManagementPage = () => {
  const [assets, setAssets] = useState<MaintenanceAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] =
    useState<MaintenanceAsset | null>(null);

  const fetchAssets = useCallback(async () => {
    try {
      setLoading(true);

      const data = await assetApi.getAll();

      setAssets(data);
      setError("");
    } catch (err: unknown) {
      setError(
        getErrorMessage(err, "Impossible de charger les équipements.")
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void fetchAssets();
    }, 0);

    return () => {
      window.clearTimeout(timer);
    };
  }, [fetchAssets]);

  const stats = useMemo(() => {
    return {
      total: assets.length,
      active: assets.filter((asset) => asset.isActive).length,
      inactive: assets.filter((asset) => !asset.isActive).length,
      linkedLocations: assets.reduce(
        (total, asset) => total + (asset._count?.locationAssets ?? 0),
        0
      ),
    };
  }, [assets]);

  const filteredAssets = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return assets.filter((asset) => {
      const matchesStatus =
        statusFilter === "ALL"
          ? true
          : statusFilter === "ACTIVE"
            ? asset.isActive
            : !asset.isActive;

      const searchValue = [
        asset.name,
        asset.code,
        asset.category ?? "",
        asset.description ?? "",
      ]
        .join(" ")
        .toLowerCase();

      return matchesStatus && searchValue.includes(normalizedSearch);
    });
  }, [assets, search, statusFilter]);

  const handleOpenCreate = () => {
    setSelectedAsset(null);
    setModalOpen(true);
  };

  const handleEdit = (asset: MaintenanceAsset) => {
    setSelectedAsset(asset);
    setModalOpen(true);
  };

  const handleSubmit = async (payload: AssetPayload) => {
    try {
      if (selectedAsset) {
        await assetApi.update(selectedAsset.id, payload);
      } else {
        await assetApi.create(payload);
      }

      setModalOpen(false);
      setSelectedAsset(null);

      await fetchAssets();
    } catch (err: unknown) {
      alert(
        getErrorMessage(
          err,
          "Impossible d’enregistrer cet équipement."
        )
      );
    }
  };

  const handleDelete = async (asset: MaintenanceAsset) => {
    if (!asset.isActive) {
      alert("Cet équipement est déjà désactivé.");
      return;
    }

    const confirmed = window.confirm(
      `Désactiver "${asset.name}" ? Il ne pourra plus être ajouté aux nouveaux endroits, mais restera visible dans l’historique des tickets.`
    );

    if (!confirmed) {
      return;
    }

    try {
      await assetApi.remove(asset.id);

      await fetchAssets();
    } catch (err: unknown) {
      alert(
        getErrorMessage(
          err,
          "Impossible de désactiver cet équipement."
        )
      );
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
            void fetchAssets();
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
            <PackageSearch size={30} />
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
              Administration
            </p>

            <h1 className="mt-2 text-4xl font-semibold tracking-tight text-[#13234b]">
              Gestion des équipements
            </h1>

            <p className="mt-2 text-slate-500">
              Créez le catalogue des équipements disponibles dans les chambres,
              cuisines, zones techniques et espaces communs.
            </p>
          </div>
        </div>

        <Button
          onClick={handleOpenCreate}
          className="rounded-full px-5 py-3"
        >
          <Plus size={18} />
          Ajouter équipement
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card className="p-5">
          <p className="text-sm uppercase tracking-[0.18em] text-slate-400">
            Total équipements
          </p>

          <p className="mt-3 text-4xl font-semibold text-[#13234b]">
            {stats.total}
          </p>
        </Card>

        <Card className="p-5">
          <p className="text-sm uppercase tracking-[0.18em] text-slate-400">
            Actifs
          </p>

          <p className="mt-3 text-4xl font-semibold text-emerald-600">
            {stats.active}
          </p>
        </Card>

        <Card className="p-5">
          <p className="text-sm uppercase tracking-[0.18em] text-slate-400">
            Désactivés
          </p>

          <p className="mt-3 text-4xl font-semibold text-slate-500">
            {stats.inactive}
          </p>
        </Card>

        <Card className="p-5">
          <p className="text-sm uppercase tracking-[0.18em] text-slate-400">
            Liaisons endroits
          </p>

          <p className="mt-3 text-4xl font-semibold text-violet-700">
            {stats.linkedLocations}
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
              placeholder="Rechercher TV, climatisation, Wi-Fi..."
              className="h-12 w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-4 text-sm outline-none transition focus:border-[#13234b]"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {[
              { label: "Tous", value: "ALL" },
              { label: "Actifs", value: "ACTIVE" },
              { label: "Désactivés", value: "INACTIVE" },
            ].map((filter) => (
              <button
                key={filter.value}
                type="button"
                onClick={() =>
                  setStatusFilter(filter.value as StatusFilter)
                }
                className={[
                  "rounded-full px-4 py-2 text-sm font-semibold transition",
                  statusFilter === filter.value
                    ? "bg-[#13234b] text-white"
                    : "bg-slate-100 text-slate-500 hover:bg-slate-200",
                ].join(" ")}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {filteredAssets.length === 0 ? (
        <EmptyState
          title="Aucun équipement"
          message="Ajoutez le premier équipement du catalogue hôtelier."
        />
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filteredAssets.map((asset) => (
            <AssetCard
              key={asset.id}
              asset={asset}
              onEdit={handleEdit}
              onDelete={(value) => {
                void handleDelete(value);
              }}
            />
          ))}
        </div>
      )}

      {modalOpen && (
        <AssetFormModal
          key={selectedAsset ? selectedAsset.id : "create-asset"}
          asset={selectedAsset}
          onClose={() => {
            setModalOpen(false);
            setSelectedAsset(null);
          }}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
};

export default AssetManagementPage;