import { Download, Eye, Power, QrCode, RotateCcw } from "lucide-react";
import Button from "../../../shared/components/ui/Button";
import Card from "../../../shared/components/ui/Card";
import type { LocationQrCode } from "../api/locationQrCodeApi";

interface Props {
  qrCode: LocationQrCode;
  onView: (qrCode: LocationQrCode) => void;
  onRegenerate: (qrCode: LocationQrCode) => void;
  onToggle: (qrCode: LocationQrCode) => void;
}

const QrCodeCard = ({ qrCode, onView, onRegenerate, onToggle }: Props) => {
  const handleDownload = () => {
    if (!qrCode.qrImageDataUrl) {
      onView(qrCode);
      return;
    }

    const link = document.createElement("a");
    link.href = qrCode.qrImageDataUrl;
    link.download = `qr-${qrCode.location.code}.png`;
    link.click();
  };

  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="rounded-2xl bg-slate-100 p-3 text-[#13234b]">
            <QrCode size={28} />
          </div>

          <div>
            <h3 className="text-lg font-semibold text-[#13234b]">
              {qrCode.location.name}
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Type : {qrCode.location.type}
              {qrCode.location.floor ? ` · Étage : ${qrCode.location.floor}` : ""}
              {qrCode.location.zone ? ` · Zone : ${qrCode.location.zone}` : ""}
            </p>

            <p className="mt-2 text-sm text-slate-400">
              Code endroit : {qrCode.location.code}
            </p>

            <p className="mt-2 break-all text-sm text-slate-400">
              {qrCode.url}
            </p>
          </div>
        </div>

        <span
          className={[
            "rounded-full px-3 py-1 text-xs font-semibold",
            qrCode.isActive
              ? "bg-emerald-50 text-emerald-700"
              : "bg-slate-100 text-slate-500",
          ].join(" ")}
        >
          {qrCode.isActive ? "Actif" : "Désactivé"}
        </span>
      </div>

      <div className="mt-5 grid gap-3 text-sm text-slate-500 md:grid-cols-3">
        <div className="rounded-2xl bg-slate-50 p-3">
          <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
            Scans
          </p>
          <p className="mt-1 font-semibold text-[#13234b]">{qrCode.scanCount}</p>
        </div>

        <div className="rounded-2xl bg-slate-50 p-3">
          <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
            Tickets
          </p>
          <p className="mt-1 font-semibold text-[#13234b]">
            {qrCode._count?.tickets ?? 0}
          </p>
        </div>

        <div className="rounded-2xl bg-slate-50 p-3">
          <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
            Dernier scan
          </p>
          <p className="mt-1 font-semibold text-[#13234b]">
            {qrCode.lastScannedAt
              ? new Date(qrCode.lastScannedAt).toLocaleString("fr-FR")
              : "Aucun"}
          </p>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <Button onClick={() => onView(qrCode)} className="rounded-full px-4">
          <Eye size={16} />
          Voir
        </Button>

        <Button onClick={handleDownload} className="rounded-full px-4">
          <Download size={16} />
          PNG
        </Button>

        <Button onClick={() => onRegenerate(qrCode)} className="rounded-full px-4">
          <RotateCcw size={16} />
          Régénérer
        </Button>

        <button
          type="button"
          onClick={() => onToggle(qrCode)}
          className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
        >
          <Power size={16} />
          {qrCode.isActive ? "Désactiver" : "Activer"}
        </button>
      </div>
    </Card>
  );
};

export default QrCodeCard;