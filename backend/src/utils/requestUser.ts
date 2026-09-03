// src/utils/requestUser.ts
import { AuthRequest } from '../middleware/auth';
import { unauthorized } from './appError';

/**
 * Dans HotelOps, seul le personnel possede un compte : un appelant authentifie
 * est donc un appelant back-office. C'est ce qui autorise `?includeInactive=true`.
 */
export const isStaffView = (req: AuthRequest): boolean => req.user?.id !== undefined;

/** Id de l'utilisateur courant, ou `null` pour un appel anonyme. */
export const currentUserId = (req: AuthRequest): number | null => req.user?.id ?? null;

/**
 * Filtre « mes commandes / mes reservations ».
 * Fail closed : demande sans utilisateur identifie => 401, jamais « tout ».
 */
export function mineFilter(req: AuthRequest, mine?: boolean): number | undefined {
  if (!mine) return undefined;
  const id = req.user?.id;
  if (id === undefined) {
    throw unauthorized("Le filtre « mine » necessite d'etre authentifie");
  }
  return id;
}