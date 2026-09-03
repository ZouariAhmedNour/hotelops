// src/features/services/api/http.ts
import api from "../../../services/api";

/**
 * Prefixe monte dans app.ts : app.use('/api/services', serviceRoutes).
 *
 * Ton client axios (src/services/api.ts) a pour baseURL `${API_SERVER_URL}/api`,
 * le "/api" est donc DEJA present : on ne met que "/services" ici, sinon les
 * appels partiraient sur /api/api/services/... et renverraient tous des 404.
 */
export const SERVICES_BASE = "/services";

export function servicesUrl(path: string): string {
  return `${SERVICES_BASE}${path}`;
}

type ParamValue =
  | string
  | number
  | boolean
  | null
  | undefined
  | (string | number)[];

/**
 * Nettoie les query params avant envoi.
 *
 * Deux pieges du backend traites ici :
 *  1. boolFlag n'accepte QUE les chaines "true" / "false" — un booleen JS
 *     serialise par axios donnerait bien "true", mais on force explicitement
 *     pour ne dependre d'aucun paramsSerializer custom ;
 *  2. une chaine vide passee a un z.coerce.number() devient 0 et fausse
 *     la requete — on supprime donc les valeurs vides.
 */
export function cleanParams(
  params: Record<string, ParamValue>,
): Record<string, string> {
  const out: Record<string, string> = {};

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === "") continue;

    if (typeof value === "boolean") {
      out[key] = value ? "true" : "false";
      continue;
    }
    if (Array.isArray(value)) {
      if (value.length === 0) continue;
      out[key] = value.join(",");
      continue;
    }
    out[key] = String(value);
  }

  return out;
}

/**
 * Retire les cles vides d'un body avant POST/PATCH.
 * Les champs optionnels du backend sont `.optional()` : envoyer "" declenche
 * une 422 min(1) inutile, alors que ne rien envoyer passe.
 */
export function cleanBody<T extends Record<string, unknown>>(body: T): T {
  const out: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(body)) {
    if (value === undefined || value === null) continue;
    if (typeof value === "string" && value.trim() === "") continue;
    if (Array.isArray(value) && value.length === 0) continue;
    out[key] = typeof value === "string" ? value.trim() : value;
  }

  return out as T;
}

export { api };
export default api;