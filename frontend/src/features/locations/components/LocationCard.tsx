import { Edit, MapPinned, QrCode, Trash2 } from "lucide-react";
import Card from "../../../shared/components/ui/Card";
import Button from "../../../shared/components/ui/Button";
import type { HotelLocation } from "../api/locationApi";

interface Props {
  location: HotelLocation;
  onEdit: (location: HotelLocation) => void;
  onDelete: (location: HotelLocation) => void;
  onGenerateQr: (location: HotelLocation) => void;
}

const typeLabels: Record<string, string> = {
  ROOM: "Chambre",
  FLOOR: "Étage",
  COMMON_AREA: "Zone commune",
  SERVICE_AREA: "Zone service",
  OUTDOOR: "Extérieur",
  PARKING: "Parking",
  OTHER: "Autre",
};

const LocationCard = ({ location, onEdit, onDelete, onGenerateQr }: Props) => {
  const hasActiveQr = Boolean(location.qrCodes?.some((qr) => qr.isActive));

  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="rounded-2xl bg-slate-100 p-3 text-[#13234b]">
            <MapPinned size={26} />
          </div>

          <div>
            <h3 className="text-lg font-semibold text-[#13234b]">
              {location.name}
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              {typeLabels[location.type] ?? location.type}
              {location.floor ? ` · Étage : ${location.floor}` : ""}
              {location.zone ? ` · Zone : ${location.zone}` : ""}
            </p>

            <p className="mt-2 text-sm text-slate-400">
              Code : {location.code}
            </p>
          </div>
        </div>

        <span
          className={[
            "rounded-full px-3 py-1 text-xs font-semibold",
            location.isActive
              ? "bg-emerald-50 text-emerald-700"
              : "bg-slate-100 text-slate-500",
          ].join(" ")}
        >
          {location.isActive ? "Actif" : "Inactif"}
        </span>
      </div>

      {location.description && (
        <p className="mt-4 text-sm leading-6 text-slate-500">
          {location.description}
        </p>
      )}

      <div className="mt-5 grid gap-3 md:grid-cols-3">
        <div className="rounded-2xl bg-slate-50 p-3">
          <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
            Tickets
          </p>
          <p className="mt-1 font-semibold text-[#13234b]">
            {location._count?.tickets ?? 0}
          </p>
        </div>

        <div className="rounded-2xl bg-slate-50 p-3">
          <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
            QR
          </p>
          <p className="mt-1 font-semibold text-[#13234b]">
            {hasActiveQr ? "Actif" : "Aucun"}
          </p>
        </div>

        <div className="rounded-2xl bg-slate-50 p-3">
          <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
            Chambre
          </p>
          <p className="mt-1 font-semibold text-[#13234b]">
            {location.roomNumber || "-"}
          </p>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <Button
          onClick={() => onGenerateQr(location)}
          className="rounded-full px-4"
        >
          <QrCode size={16} />
          Générer QR
        </Button>

        <button
          type="button"
          onClick={() => onEdit(location)}
          className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
        >
          <Edit size={16} />
          Modifier
        </button>

        <button
          type="button"
          onClick={() => onDelete(location)}
          className="inline-flex items-center gap-2 rounded-full border border-red-100 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50"
        >
          <Trash2 size={16} />
          Supprimer
        </button>
      </div>
    </Card>
  );
};

export default LocationCard;