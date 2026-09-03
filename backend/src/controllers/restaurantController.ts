// src/controllers/restaurantController.ts
import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import * as restaurantService from '../services/restaurantService';
import * as serviceBookingService from '../services/serviceBookingService';
import {
  availableTablesQuerySchema,
  createRestaurantBookingSchema,
  createRoomSchema,
  createTableSchema,
  includeInactiveQuerySchema,
  listBookingsQuerySchema,
  listTablesQuerySchema,
  updateBookingStatusSchema,
  updateRoomSchema,
  updateTableSchema,
} from '../validators/serviceValidators';
import { parseBody, parseId, parseQuery } from '../utils/validate';
import { currentUserId, isStaffView, mineFilter } from '../utils/requestUser';
import { success } from '../utils/response';

const RESTAURANT_DOMAINS = ['RESTAURANT'] as const;

/* Salles ------------------------------------------------------------ */

export async function listRooms(req: AuthRequest, res: Response): Promise<void> {
  const query = parseQuery(includeInactiveQuerySchema, req.query);
  const rooms = await restaurantService.listRooms(
    isStaffView(req) && (query.includeInactive ?? false),
  );
  success(res, rooms);
}

export async function getRoomById(req: AuthRequest, res: Response): Promise<void> {
  const room = await restaurantService.getRoomById(parseId(req.params.id));
  success(res, room);
}

export async function createRoom(req: AuthRequest, res: Response): Promise<void> {
  const data = parseBody(createRoomSchema, req.body);
  const room = await restaurantService.createRoom(data);
  success(res, room, 'Salle créée', 201);
}

export async function updateRoom(req: AuthRequest, res: Response): Promise<void> {
  const data = parseBody(updateRoomSchema, req.body);
  const room = await restaurantService.updateRoom(parseId(req.params.id), data);
  success(res, room, 'Salle mise à jour');
}

export async function removeRoom(req: AuthRequest, res: Response): Promise<void> {
  const room = await restaurantService.deactivateRoom(parseId(req.params.id));
  success(res, room, 'Salle désactivée');
}

/* Tables ------------------------------------------------------------ */

export async function listTables(req: AuthRequest, res: Response): Promise<void> {
  const query = parseQuery(listTablesQuerySchema, req.query);
  const tables = await restaurantService.listTables({
    ...query,
    includeInactive: isStaffView(req) && query.includeInactive,
  });
  success(res, tables);
}

export async function availableTables(req: AuthRequest, res: Response): Promise<void> {
  const query = parseQuery(availableTablesQuerySchema, req.query);
  const tables = await restaurantService.findAvailableTables(query);
  success(res, tables);
}

export async function createTable(req: AuthRequest, res: Response): Promise<void> {
  const data = parseBody(createTableSchema, req.body);
  const table = await restaurantService.createTable(data);
  success(res, table, 'Table créée', 201);
}

export async function updateTable(req: AuthRequest, res: Response): Promise<void> {
  const data = parseBody(updateTableSchema, req.body);
  const table = await restaurantService.updateTable(parseId(req.params.id), data);
  success(res, table, 'Table mise à jour');
}

export async function removeTable(req: AuthRequest, res: Response): Promise<void> {
  const table = await restaurantService.deactivateTable(parseId(req.params.id));
  success(res, table, 'Table désactivée');
}

/* Réservations ------------------------------------------------------ */

export async function listBookings(req: AuthRequest, res: Response): Promise<void> {
  const query = parseQuery(listBookingsQuerySchema, req.query);
  const result = await serviceBookingService.listBookings({
    domains: RESTAURANT_DOMAINS,
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
  const booking = await serviceBookingService.getBookingById(
    parseId(req.params.id),
    RESTAURANT_DOMAINS,
  );
  success(res, booking);
}

export async function createBooking(req: AuthRequest, res: Response): Promise<void> {
  const data = parseBody(createRestaurantBookingSchema, req.body);
  const booking = await restaurantService.createRestaurantBooking({
    ...data,
    userId: currentUserId(req),
  });
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
    allowedDomains: RESTAURANT_DOMAINS,
  });
  success(res, booking, `Réservation passée en ${data.status}`);
}