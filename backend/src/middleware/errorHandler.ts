// src/middleware/errorHandler.ts
import { ErrorRequestHandler, NextFunction, Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import { AppError } from '../utils/appError';
import { error as sendError } from '../utils/response';

function describeTarget(meta: unknown): string {
  const target = (meta as { target?: unknown } | null | undefined)?.target;
  if (Array.isArray(target)) return target.map((value) => String(value)).join(', ');
  if (typeof target === 'string') return target;
  return 'champ unique';
}

export const errorHandler: ErrorRequestHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (res.headersSent) {
    next(err);
    return;
  }

  // 1. Erreurs metier explicites
  if (err instanceof AppError) {
    sendError(res, err.message, err.statusCode, err.details ?? null);
    return;
  }

  // 2. Erreurs Prisma connues
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    switch (err.code) {
      case 'P2002':
        sendError(res, `Cette valeur existe deja (${describeTarget(err.meta)})`, 409);
        return;
      case 'P2003':
        sendError(res, 'Reference invalide : un element lie est introuvable', 422);
        return;
      case 'P2025':
        sendError(res, 'Ressource introuvable ou deja modifiee', 404);
        return;
      default:
        break;
    }
  }

  if (err instanceof Prisma.PrismaClientValidationError) {
    sendError(res, 'Requete invalide vers la base de donnees', 400);
    return;
  }

  // 3. ZodError qui n'est pas passee par parseBody / parseQuery
  if (err instanceof Error && err.name === 'ZodError') {
    const issues = (err as unknown as { issues?: unknown }).issues;
    sendError(res, 'Donnees invalides', 422, Array.isArray(issues) ? issues : null);
    return;
  }

  // 4. Filet de securite
  console.error('[errorHandler]', err);
  const isProduction = process.env.NODE_ENV === 'production';
  const message =
    !isProduction && err instanceof Error && err.message ? err.message : 'Erreur serveur';
  sendError(res, message, 500);
};

export default errorHandler;