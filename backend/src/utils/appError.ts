// src/utils/appError.ts

/**
 * Erreur metier porteuse de son code HTTP.
 * Le errorHandler la traduit directement en reponse : plus besoin de
 * deviner le statut avec des `err.message.includes('introuvable')`.
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly details: unknown;
  public readonly isOperational = true;

  constructor(message: string, statusCode = 400, details: unknown = null) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.details = details;
    Object.setPrototypeOf(this, AppError.prototype);
    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, AppError);
    }
  }
}

export const badRequest = (message: string, details?: unknown): AppError =>
  new AppError(message, 400, details ?? null);

export const unauthorized = (message = 'Authentification requise'): AppError =>
  new AppError(message, 401);

export const forbidden = (message = 'Acces refuse'): AppError => new AppError(message, 403);

export const notFound = (message = 'Ressource introuvable'): AppError =>
  new AppError(message, 404);

export const conflict = (message: string, details?: unknown): AppError =>
  new AppError(message, 409, details ?? null);

export const unprocessable = (message: string, details?: unknown): AppError =>
  new AppError(message, 422, details ?? null);