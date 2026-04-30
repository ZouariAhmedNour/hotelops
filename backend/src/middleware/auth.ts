import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { jwtSecret } from '../config/env';
import { error } from '../utils/response';

interface JwtPayload {
  id: number;
  roleCode: string;
}

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
    req.user = payload;
    next();
  } catch (err) {
    return error(res, 'Token invalide ou expiré', 401);
  }
};

export const authorize = (...roles: string[]) => {
  return (
    req: Request & { user?: JwtPayload },
    res: Response,
    next: NextFunction
  ) => {
    if (!req.user) return error(res, 'Non authentifié', 401);

    if (!roles.includes(req.user.roleCode)) {
      return error(res, 'Accès interdit : rôle insuffisant', 403);
    }

    next();
  };
};