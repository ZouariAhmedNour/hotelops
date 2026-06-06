import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { jwtSecret } from "../config/env";
import { error } from "../utils/response";
import { prisma } from "../config/prisma";

export interface AuthUser {
  userId: number;
  id: number;
  email: string;
  roleCode: string;
  roleId: number;
}

export interface AuthRequest extends Request {
  user?: AuthUser;
}

interface JwtPayload {
  userId: number;
  email: string;
  roleCode: string;
}

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return error(res, "Token d'authentification manquant", 401);
  }

  const token = authHeader.split(" ")[1];

  try {
    const payload = jwt.verify(token, jwtSecret) as JwtPayload;

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      include: { role: true },
    });

    if (!user || !user.isActive) {
      return error(res, "Utilisateur inactif ou introuvable", 401);
    }

    req.user = {
      userId: user.id,
      id: user.id,
      email: user.email,
      roleCode: user.role.code,
      roleId: user.roleId,
    };

    next();
  } catch {
    return error(res, "Token invalide ou expiré", 401);
  }
};

export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return error(res, "Non authentifié", 401);
    }

    if (!roles.includes(req.user.roleCode)) {
      return error(res, "Accès interdit : rôle insuffisant", 403);
    }

    next();
  };
};

export const requireAdmin = authorize("ADMIN");

export const requireManager = authorize(
  "ADMIN",
  "CHEF_MAINT",
  "RECEPTION"
);

export const requireMaintenance = authorize(
  "ADMIN",
  "CHEF_MAINT",
  "MAINTENANCE_AGENT"
);