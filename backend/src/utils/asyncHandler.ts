// src/utils/asyncHandler.ts
import { NextFunction, Request, RequestHandler, Response } from 'express';

type MaybeAsyncHandler<Req extends Request> = (
  req: Req,
  res: Response,
  next: NextFunction,
) => unknown | Promise<unknown>;

/**
 * Express 5 propage deja les rejets de promesse vers le errorHandler, mais
 * l'enrobage rend ce comportement explicite (et resiste a un retour en v4).
 * Bonus : il autorise un handler type AuthRequest sur un Router standard.
 */
export function asyncHandler<Req extends Request>(handler: MaybeAsyncHandler<Req>): RequestHandler {
  return (req, res, next) => {
    void Promise.resolve(handler(req as unknown as Req, res, next)).catch(next);
  };
}

export const ah = asyncHandler;