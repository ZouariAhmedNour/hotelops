import { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('[ErrorHandler]', err);

  // 🔹 Zod validation
  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      message: 'Données invalides',
      errors: err.issues.map(e => ({
        field: e.path.join('.'),
        message: e.message,
      })),
    });
  }

  // 🔹 Prisma unique constraint
  if (err.code === 'P2002') {
    return res.status(409).json({
      success: false,
      message: "Cette valeur existe déjà (contrainte d'unicité)",
    });
  }

  // 🔹 Prisma not found
  if (err.code === 'P2025') {
    return res.status(404).json({
      success: false,
      message: 'Ressource introuvable',
    });
  }

  // 🔹 Default error
  return res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Erreur interne du serveur',
  });
};