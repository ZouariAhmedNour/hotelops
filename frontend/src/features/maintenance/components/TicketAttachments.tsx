import Card from "../../../shared/components/ui/Card";
import { formatDateTime } from "../../../shared/utils/date";
import type { MaintenanceAttachment } from "../types/maintenance.types";

type TicketAttachmentsProps = {
  attachments?: MaintenanceAttachment[];
};

const API_BASE_URL =
  import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:3000";

const formatFileSize = (size: number) => {
  if (size < 1024) return `${size} o`;
  if (size < 1024 * 1024) return `${Math.round(size / 1024)} Ko`;

  return `${(size / (1024 * 1024)).toFixed(1)} Mo`;
};

const getAttachmentUrl = (filePath: string) => {
  const normalizedPath = filePath.replaceAll("\\", "/");

  if (normalizedPath.startsWith("http")) {
    return normalizedPath;
  }

  const uploadsIndex = normalizedPath.toLowerCase().lastIndexOf("/uploads/");

  if (uploadsIndex !== -1) {
    return `${API_BASE_URL}${normalizedPath.slice(uploadsIndex)}`;
  }

  if (normalizedPath.startsWith("uploads/")) {
    return `${API_BASE_URL}/${normalizedPath}`;
  }

  if (normalizedPath.startsWith("/uploads/")) {
    return `${API_BASE_URL}${normalizedPath}`;
  }

  return `${API_BASE_URL}/${normalizedPath}`;
};

const TicketAttachments = ({ attachments = [] }: TicketAttachmentsProps) => {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-2xl font-semibold text-[#13234b]">
          Pièces jointes
        </h2>

        <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-600">
          {attachments.length}
        </span>
      </div>

      {attachments.length === 0 ? (
        <p className="mt-4 text-slate-500">
          Aucun fichier n’a été joint à ce ticket.
        </p>
      ) : (
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          {attachments.map((attachment) => {
            const fileUrl = getAttachmentUrl(attachment.filePath);
            const isImage = attachment.mimeType.startsWith("image/");
            const isPdf = attachment.mimeType === "application/pdf";

            return (
              <a
                key={attachment.id}
                href={fileUrl}
                target="_blank"
                rel="noreferrer"
                className="group overflow-hidden rounded-2xl border border-slate-200 bg-white transition hover:border-blue-300 hover:shadow-md"
              >
                {isImage ? (
                  <div className="h-44 overflow-hidden bg-slate-100">
                    <img
                      src={fileUrl}
                      alt={attachment.fileName}
                      className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                    />
                  </div>
                ) : (
                  <div className="flex h-44 items-center justify-center bg-slate-100 text-5xl">
                    {isPdf ? "📄" : "📎"}
                  </div>
                )}

                <div className="p-4">
                  <p className="line-clamp-1 font-semibold text-slate-900">
                    {attachment.fileName}
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    {formatFileSize(attachment.fileSize)}
                  </p>

                  {attachment.caption && (
                    <p className="mt-2 text-sm text-slate-600">
                      {attachment.caption}
                    </p>
                  )}

                  {attachment.uploadedBy && (
                    <p className="mt-3 text-xs text-slate-400">
                      Ajouté par {attachment.uploadedBy.firstName}{" "}
                      {attachment.uploadedBy.lastName}
                    </p>
                  )}

                  <p className="mt-1 text-xs text-slate-400">
                    {formatDateTime(attachment.createdAt)}
                  </p>
                </div>
              </a>
            );
          })}
        </div>
      )}
    </Card>
  );
};

export default TicketAttachments;