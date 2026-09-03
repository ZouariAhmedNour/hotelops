// src/features/services/utils/media.ts
import { api } from "../api/http";

function getServerOrigin(): string {
  const base = api.defaults.baseURL ?? "";
  const origin = base.replace(/\/api\/?$/, "");
  console.log("[media] baseURL:", base, "→ origin:", origin); // temporaire
  return origin;
}

export function resolvePhotoUrl(path: string | null | undefined): string | undefined {
  if (!path) return undefined;
  if (path.startsWith("http")) return path;
  const url = `${getServerOrigin()}${path}`;
  console.log("[media] resolvePhotoUrl:", path, "→", url); // temporaire
  return url;
}