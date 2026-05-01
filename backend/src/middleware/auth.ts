import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { jwtSecret } from '../config/env';
import { error } from '../utils/response';

// 🔹 Payload JWT aligné avec ton authService
interface JwtPayload {
  userId: number;
  email: string;
  roleCode: string;
}

// 🔹 Middleware authenticate
export const authenticate = (
  req: Request & { user?: JwtPayload },
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return error(res, "Token d'authentification manquant", 401);
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = jwt.verify(token, jwtSecret) as JwtPayload;

    // 🔹 inject user
    req.user = payload;

    next();
  } catch (err) {
    return error(res, 'Token invalide ou expiré', 401);
  }
};

// 🔹 Middleware authorize (roles)
export const authorize = (...roles: string[]) => {
  return (
    req: Request & { user?: JwtPayload },
    res: Response,
    next: NextFunction
  ) => {
    if (!req.user) {
      return error(res, 'Non authentifié', 401);
    }

    if (!roles.includes(req.user.roleCode)) {
      return error(res, 'Accès interdit : rôle insuffisant', 403);
    }

    next();
  };
};