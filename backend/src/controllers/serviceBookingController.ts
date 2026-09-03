// src/controllers/serviceBookingController.ts
// Réservations des domaines sans extension dédiée :
// PLAYROOM | POOL | FITNESS | ACTIVITY | CONCIERGERIE
import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import * as serviceBookingService from '../services/serviceBookingService';
import {
  createGenericBookingSchema,
  listGenericBookingsQuerySchema,
  updateBookingStatusSchema,
} from '../validators/serviceValidators';
import { GENERIC_BOOKING_DOMAINS } from '../types/service.types';
import { parseBody, parseId, parseQuery } from '../utils/validate';
import { currentUserId, mineFilter } from '../utils/requestUser';
import { success } from '../utils/response';

export async function list(req: AuthRequest, res: Response): Promise<void> {
  const query = parseQuery(listGenericBookingsQuerySchema, req.query);
  const result = await serviceBookingService.listBookings({
    domains: query.domain ? [query.domain] : GENERIC_BOOKING_DOMAINS,
    page: query.page,
    limit: query.limit,
    status: query.status,
    date: query.date,
    from: query.from,
    to: query.to,
    userId: mineFilter(req, query.mine),
  });
  success(res, result);
}

export async function getById(req: AuthRequest, res: Response): Promise<void> {
  const booking = await serviceBookingService.getBookingById(
    parseId(req.params.id),
    GENERIC_BOOKING_DOMAINS,
  );
  success(res, booking);
}

export async function create(req: AuthRequest, res: Response): Promise<void> {
  const data = parseBody(createGenericBookingSchema, req.body);
  const booking = await serviceBookingService.createGenericBooking({
    ...data,
    userId: currentUserId(req),
  });
  success(res, booking, 'Réservation enregistrée', 201);
}

export async function updateStatus(req: AuthRequest, res: Response): Promise<void> {
  const data = parseBody(updateBookingStatusSchema, req.body);
  const booking = await serviceBookingService.updateBookingStatus({
    id: parseId(req.params.id),
    status: data.status,
    userId: currentUserId(req),
    message: data.message,
    cancelReason: data.cancelReason,
    allowedDomains: GENERIC_BOOKING_DOMAINS,
  });
  success(res, booking, `Réservation passée en ${data.status}`);
}