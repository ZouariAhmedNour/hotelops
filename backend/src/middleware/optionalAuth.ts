// src/middleware/optionalAuth.ts
import { NextFunction, Request, RequestHandler, Response } from 'express';
import { authenticate } from './auth';

/**
 * Authentification facultative : la carte des services reste consultable sans
 * compte, mais un token valide expose `req.user` — ce qui permet aux controleurs
 * de reserver `?includeInactive=true` au personnel.
 * Le cast neutralise la difference de signature (Request vs AuthRequest).
 */
export const optionalAuthenticate: RequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (!req.headers.authorization) {
    next();
    return;
  }
  (authenticate as unknown as RequestHandler)(req, res, next);
};

export default optionalAuthenticate;