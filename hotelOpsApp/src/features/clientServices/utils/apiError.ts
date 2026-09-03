// src/features/services/utils/apiError.ts
import axios from "axios";

import type { ApiFieldError } from "../types/service.types";

type ErrorPayload = {
  success?: boolean;
  message?: string;
  /**
   * Le backend met la cle `errors` seulement si elle est truthy.
   * Deux formes possibles :
   *  - FieldError[] pour les 422 de validation Zod ;
   *  - un objet libre pour les `details` d'une AppError
   *    (ex. { services: ["12:00-15:00"] } quand le restaurant est ferme).
   */
  errors?: ApiFieldError[] | Record<string, unknown> | null;
};

function readPayload(err: unknown): ErrorPayload | undefined {
  if (!axios.isAxiosError(err)) return undefined;
  const data = err.response?.data;
  if (!data || typeof data !== "object") return undefined;
  return data as ErrorPayload;
}

function isFieldErrorArray(value: unknown): value is ApiFieldError[] {
  return (
    Array.isArray(value) &&
    value.every(
      (entry) =>
        !!entry &&
        typeof entry === "object" &&
        typeof (entry as ApiFieldError).message === "string",
    )
  );
}

/** Message lisible pour un Alert ou un bandeau d'erreur. */
export function getApiMessage(
  err: unknown,
  fallback = "Une erreur est survenue",
): string {
  const payload = readPayload(err);

  if (payload) {
    if (isFieldErrorArray(payload.errors) && payload.errors.length > 0) {
      return payload.errors.map((entry) => entry.message).join("\n");
    }
    if (payload.message) return payload.message;
  }

  if (axios.isAxiosError(err)) {
    if (err.response?.status === 401) {
      return "Session expiree, reconnecte-toi.";
    }
    if (!err.response) {
      return "Serveur injoignable. Verifie l'URL de l'API et ta connexion.";
    }
  }

  if (err instanceof Error && err.message) return err.message;
  return fallback;
}

/**
 * Erreurs par champ, pour les afficher sous les AppInput.
 * Vide si le backend n'a pas renvoye de FieldError[].
 */
export function getFieldErrors(err: unknown): Record<string, string> {
  const payload = readPayload(err);
  if (!payload || !isFieldErrorArray(payload.errors)) return {};

  const out: Record<string, string> = {};
  for (const entry of payload.errors) {
    if (entry.field && !out[entry.field]) out[entry.field] = entry.message;
  }
  return out;
}

/**
 * Details libres d'une AppError, utilises pour enrichir un message.
 * Exemple : les horaires d'ouverture renvoyes par assertRestaurantOpen().
 */
export function getErrorDetails(err: unknown): Record<string, unknown> | null {
  const payload = readPayload(err);
  if (!payload || !payload.errors) return null;
  if (isFieldErrorArray(payload.errors)) return null;
  if (Array.isArray(payload.errors)) return null;
  return payload.errors as Record<string, unknown>;
}

export function getStatusCode(err: unknown): number | null {
  return axios.isAxiosError(err) ? (err.response?.status ?? null) : null;
}