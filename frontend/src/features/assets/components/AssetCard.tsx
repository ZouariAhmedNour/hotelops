import { Edit, MapPinned, Ticket, Trash2 } from "lucide-react";

import Card from "../../../shared/components/ui/Card";

import { AssetIcon } from "../utils/assetIcon";

import type { MaintenanceAsset } from "../types/asset.types";

interface Props {
  asset: MaintenanceAsset;
  onEdit: (asset: MaintenanceAsset) => void;
  onDelete: (asset: MaintenanceAsset) => void;
}

const AssetCard = ({ asset, onEdit, onDelete }: Props) => {
  const locationCount = asset._count?.locationAssets ?? 0;
  const ticketCount = asset._count?.ticketAssets ?? 0;

  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-4">
          <div className="rounded-2xl bg-slate-100 p-3 text-[#13234b]">
            <AssetIcon icon={asset.icon} size={26} />
          </div>

          <div className="min-w-0">
            <h3 className="truncate text-lg font-semibold text-[#13234b]">
              {asset.name}
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              {asset.category || "Sans catégorie"}
            </p>

            <p className="mt-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
              {asset.code}
            </p>
          </div>
        </div>

        <span
          className={[
            "shrink-0 rounded-full px-3 py-1 text-xs font-semibold",
            asset.isActive
              ? "bg-emerald-50 text-emerald-700"
              : "bg-slate-100 text-slate-500",
          ].join(" ")}
        >
          {asset.isActive ? "Actif" : "Désactivé"}
        </span>
      </div>

      {asset.description && (
        <p className="mt-4 min-h-[42px] text-sm leading-6 text-slate-500">
          {asset.description}
        </p>
      )}

      <div className="mt-5 grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-slate-50 p-3">
          <div className="flex items-center gap-2 text-slate-400">
            <MapPinned size={15} />

            <p className="text-xs uppercase tracking-[0.14em]">
              Endroits
            </p>
          </div>

          <p className="mt-2 text-xl font-semibold text-[#13234b]">
            {locationCount}
          </p>
        </div>

        <div className="rounded-2xl bg-slate-50 p-3">
          <div className="flex items-center gap-2 text-slate-400">
            <Ticket size={15} />

            <p className="text-xs uppercase tracking-[0.14em]">Tickets</p>
          </div>

          <p className="mt-2 text-xl font-semibold text-[#13234b]">
            {ticketCount}
          </p>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => onEdit(asset)}
          className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
        >
          <Edit size={16} />
          Modifier
        </button>

        <button
          type="button"
          onClick={() => onDelete(asset)}
          className="inline-flex items-center gap-2 rounded-full border border-red-100 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50"
        >
          <Trash2 size={16} />
          {asset.isActive ? "Désactiver" : "Garder désactivé"}
        </button>
      </div>
    </Card>
  );
};

export default AssetCard;