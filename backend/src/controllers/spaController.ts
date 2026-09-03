// src/controllers/spaController.ts
import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import * as spaService from '../services/spaService';
import * as serviceBookingService from '../services/serviceBookingService';
import {
  assignTherapistSchema,
  createSpaBookingSchema,
  createTherapistSchema,
  createTreatmentSchema,
  includeInactiveQuerySchema,
  listBookingsQuerySchema,
  listTherapistsQuerySchema,
  updateBookingStatusSchema,
  updateTherapistSchema,
  updateTreatmentSchema,
} from '../validators/serviceValidators';
import { parseBody, parseId, parseQuery } from '../utils/validate';
import { currentUserId, isStaffView, mineFilter } from '../utils/requestUser';
import { success } from '../utils/response';

const SPA_DOMAINS = ['SPA'] as const;

/* Thérapeutes ------------------------------------------------------- */

export async function listTherapists(req: AuthRequest, res: Response): Promise<void> {
  const query = parseQuery(listTherapistsQuerySchema, req.query);
  const therapists = await spaService.listTherapists({
    ...query,
    includeInactive: isStaffView(req) && query.includeInactive,
  });
  success(res, therapists);
}

export async function createTherapist(req: AuthRequest, res: Response): Promise<void> {
  const data = parseBody(createTherapistSchema, req.body);
  const therapist = await spaService.createTherapist(data);
  success(res, therapist, 'Thérapeute créé', 201);
}

export async function updateTherapist(req: AuthRequest, res: Response): Promise<void> {
  const data = parseBody(updateTherapistSchema, req.body);
  const therapist = await spaService.updateTherapist(parseId(req.params.id), data);
  success(res, therapist, 'Thérapeute mis à jour');
}

export async function removeTherapist(req: AuthRequest, res: Response): Promise<void> {
  const therapist = await spaService.deactivateTherapist(parseId(req.params.id));
  success(res, therapist, 'Thérapeute désactivé');
}

/* Fiches de soin ---------------------------------------------------- */

export async function listTreatments(req: AuthRequest, res: Response): Promise<void> {
  const query = parseQuery(includeInactiveQuerySchema, req.query);
  const treatments = await spaService.listTreatments(
    isStaffView(req) && (query.includeInactive ?? false),
  );
  success(res, treatments);
}

export async function getTreatmentById(req: AuthRequest, res: Response): Promise<void> {
  const treatment = await spaService.getTreatmentById(parseId(req.params.id));
  success(res, treatment);
}

export async function createTreatment(req: AuthRequest, res: Response): Promise<void> {
  const data = parseBody(createTreatmentSchema, req.body);
  const treatment = await spaService.createTreatment(data);
  success(res, treatment, 'Fiche de soin créée', 201);
}

export async function updateTreatment(req: AuthRequest, res: Response): Promise<void> {
  const data = parseBody(updateTreatmentSchema, req.body);
  const treatment = await spaService.updateTreatment(parseId(req.params.id), data);
  success(res, treatment, 'Fiche de soin mise à jour');
}

/* Réservations ------------------------------------------------------ */

export async function listBookings(req: AuthRequest, res: Response): Promise<void> {
  const query = parseQuery(listBookingsQuerySchema, req.query);
  const result = await serviceBookingService.listBookings({
    domains: SPA_DOMAINS,
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

export async function getBookingById(req: AuthRequest, res: Response): Promise<void> {
  const booking = await serviceBookingService.getBookingById(parseId(req.params.id), SPA_DOMAINS);
  success(res, booking);
}

export async function createBooking(req: AuthRequest, res: Response): Promise<void> {
  const data = parseBody(createSpaBookingSchema, req.body);
  const booking = await spaService.createSpaBooking({ ...data, userId: currentUserId(req) });
  success(res, booking, 'Réservation enregistrée', 201);
}

export async function updateBookingStatus(req: AuthRequest, res: Response): Promise<void> {
  const data = parseBody(updateBookingStatusSchema, req.body);
  const booking = await serviceBookingService.updateBookingStatus({
    id: parseId(req.params.id),
    status: data.status,
    userId: currentUserId(req),
    message: data.message,
    cancelReason: data.cancelReason,
    allowedDomains: SPA_DOMAINS,
  });
  success(res, booking, `Réservation passée en ${data.status}`);
}

export async function assignTherapist(req: AuthRequest, res: Response): Promise<void> {
  const data = parseBody(assignTherapistSchema, req.body);
  const booking = await spaService.assignTherapist(
    parseId(req.params.id),
    data,
    currentUserId(req),
  );
  success(res, booking, 'Thérapeute affecté');
}