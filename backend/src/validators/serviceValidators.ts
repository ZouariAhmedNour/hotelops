// src/validators/serviceValidators.ts
import { z } from 'zod';
import {
  DEFAULT_PAGE_SIZE,
  GENDER_PREFERENCES,
  GENERIC_BOOKING_DOMAINS,
  MAX_PAGE_SIZE,
  SERVICE_BOOKING_STATUSES,
  SERVICE_DOMAINS,
  SERVICE_ORDER_STATUSES,
  THERAPIST_GENDERS,
  TIME_PATTERN,
} from '../types/service.types';

/* ------------------------------------------------------------------ *
 *  Briques réutilisables
 * ------------------------------------------------------------------ */

const dbId = z.number().int().positive();
const queryId = z.coerce.number().int().positive();
const money = z.number().nonnegative().max(99999999.99);
const delta = z.number().min(-99999.99).max(99999.99);
const time = z.string().regex(TIME_PATTERN, 'Format attendu HH:mm (00:00 → 23:59)');
const domainEnum = z.enum(SERVICE_DOMAINS);

const shortText = (min: number, max: number) => z.string().trim().min(min).max(max);
const longText = (max: number) => z.string().trim().max(max);

const code = z
  .string()
  .trim()
  .min(2)
  .max(40)
  .regex(/^[A-Za-z0-9_-]+$/, 'Lettres, chiffres, tiret et underscore uniquement')
  .transform((value) => value.toUpperCase());

/**
 * Un booléen en query string : "true" / "false" seulement.
 * z.coerce.boolean() est un piège — Boolean("false") vaut true.
 */
const boolFlag = z.enum(['true', 'false']).transform((value) => value === 'true');

const idList = z
  .array(dbId)
  .max(30)
  .transform((ids) => Array.from(new Set(ids)));

export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(MAX_PAGE_SIZE).default(DEFAULT_PAGE_SIZE),
});

/* ------------------------------------------------------------------ *
 *  Catégories
 * ------------------------------------------------------------------ */

export const createCategorySchema = z.object({
  name: shortText(2, 80),
  code,
  domain: domainEnum,
  icon: z.string().trim().max(60).optional(),
  description: longText(500).optional(),
  sortOrder: z.number().int().min(0).max(9999).optional(),
});

export const updateCategorySchema = createCategorySchema
  .partial()
  .extend({ isActive: z.boolean().optional() });

export const listCategoriesQuerySchema = z.object({
  domain: domainEnum.optional(),
  includeInactive: boolFlag.optional(),
});

/* ------------------------------------------------------------------ *
 *  Articles / prestations
 *  `domain` n'est jamais accepté depuis le client : il est dérivé de la
 *  catégorie, sinon la dénormalisation devient incohérente.
 * ------------------------------------------------------------------ */

const itemBaseSchema = z.object({
  categoryId: dbId,
  name: shortText(2, 120),
  description: longText(1000).optional(),
  photos: z.array(z.string().trim().min(1).max(500)).max(10).optional(),
  price: money.optional(),
  priceMin: money.optional(),
  priceMax: money.optional(),
  durationMinutes: z.number().int().positive().max(1440).optional(),
  prepTimeMinutes: z.number().int().positive().max(1440).optional(),
  allergens: z.array(z.string().trim().min(1).max(40)).max(20).optional(),
  isAvailable: z.boolean().optional(),
  sortOrder: z.number().int().min(0).max(9999).optional(),
});

const priceRangeIsValid = (data: { priceMin?: number; priceMax?: number }): boolean =>
  data.priceMin === undefined || data.priceMax === undefined || data.priceMin <= data.priceMax;

const PRICE_RANGE_MESSAGE = 'priceMin doit être inférieur ou égal à priceMax';

export const createItemSchema = itemBaseSchema.refine(priceRangeIsValid, {
  message: PRICE_RANGE_MESSAGE,
  path: ['priceMin'],
});

export const updateItemSchema = itemBaseSchema
  .partial()
  .extend({ isActive: z.boolean().optional() })
  .refine(priceRangeIsValid, { message: PRICE_RANGE_MESSAGE, path: ['priceMin'] });

export const listItemsQuerySchema = paginationSchema.extend({
  domain: domainEnum.optional(),
  categoryId: queryId.optional(),
  isAvailable: boolFlag.optional(),
  includeInactive: boolFlag.optional(),
  search: z.string().trim().min(1).max(80).optional(),
});

/* ------------------------------------------------------------------ *
 *  Options et suppléments
 * ------------------------------------------------------------------ */

export const createOptionSchema = z.object({
  itemId: dbId,
  name: shortText(1, 80),
  priceDelta: delta.optional(),
});

export const updateOptionSchema = z.object({
  name: shortText(1, 80).optional(),
  priceDelta: delta.optional(),
  isActive: z.boolean().optional(),
});

export const createSupplementSchema = z.object({
  itemId: dbId,
  name: shortText(1, 80),
  price: money,
});

export const updateSupplementSchema = z.object({
  name: shortText(1, 80).optional(),
  price: money.optional(),
  isActive: z.boolean().optional(),
});

/* ------------------------------------------------------------------ *
 *  Créneaux d'ouverture
 * ------------------------------------------------------------------ */

const slotBaseSchema = z.object({
  itemId: dbId.optional(),
  categoryId: dbId.optional(),
  dayOfWeek: z.number().int().min(0).max(6),
  startTime: time,
  endTime: time,
  capacity: z.number().int().positive().max(10000).optional(),
});

const slotTargetIsValid = (data: { itemId?: number; categoryId?: number }): boolean =>
  (data.itemId === undefined) !== (data.categoryId === undefined);

const slotRangeIsValid = (data: { startTime?: string; endTime?: string }): boolean =>
  data.startTime === undefined || data.endTime === undefined || data.startTime < data.endTime;

export const createSlotSchema = slotBaseSchema
  .refine(slotTargetIsValid, {
    message: 'Renseigne soit itemId, soit categoryId — jamais les deux',
    path: ['itemId'],
  })
  .refine(slotRangeIsValid, {
    message: 'endTime doit être postérieur à startTime',
    path: ['endTime'],
  });

export const updateSlotSchema = slotBaseSchema
  .omit({ itemId: true, categoryId: true })
  .partial()
  .extend({ isActive: z.boolean().optional() })
  .refine(slotRangeIsValid, {
    message: 'endTime doit être postérieur à startTime',
    path: ['endTime'],
  });

export const listSlotsQuerySchema = z.object({
  itemId: queryId.optional(),
  categoryId: queryId.optional(),
  dayOfWeek: z.coerce.number().int().min(0).max(6).optional(),
  includeInactive: boolFlag.optional(),
});

/* ------------------------------------------------------------------ *
 *  Room service (ServiceOrder)
 * ------------------------------------------------------------------ */

export const orderLineSchema = z.object({
  itemId: dbId,
  quantity: z.number().int().positive().max(50).default(1),
  optionIds: idList.optional(),
  supplementIds: idList.optional(),
  comment: longText(300).optional(),
});

export const createOrderSchema = z.object({
  roomNumber: shortText(1, 20),
  paymentMethod: z.enum(['ROOM_CHARGE', 'CASH', 'CARD']).optional(),
  comment: longText(500).optional(),
  lines: z
    .array(orderLineSchema)
    .min(1, 'La commande doit contenir au moins une ligne')
    .max(30),
});

export const listOrdersQuerySchema = paginationSchema.extend({
  status: z.enum(SERVICE_ORDER_STATUSES).optional(),
  roomNumber: shortText(1, 20).optional(),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
  mine: boolFlag.optional(),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum(SERVICE_ORDER_STATUSES),
  message: longText(300).optional(),
  cancelReason: longText(300).optional(),
});

/* ------------------------------------------------------------------ *
 *  Restaurant
 * ------------------------------------------------------------------ */

export const createRoomSchema = z.object({
  name: shortText(2, 80),
  code,
  type: shortText(2, 40),
  capacity: z.number().int().positive().max(2000).optional(),
});

export const updateRoomSchema = createRoomSchema
  .partial()
  .extend({ isActive: z.boolean().optional() });

export const createTableSchema = z.object({
  roomId: dbId,
  itemId: dbId.optional(),
  name: shortText(1, 60),
  code,
  seats: z.number().int().positive().max(50),
});

/** `itemId: null` détache la table de son article (impossible avec un simple `.partial()`). */
export const updateTableSchema = createTableSchema
  .partial()
  .extend({ isActive: z.boolean().optional(), itemId: dbId.nullable().optional() });

/** Filtre commun aux listes de référentiel. */
export const includeInactiveQuerySchema = z.object({
  includeInactive: boolFlag.optional(),
});

export const availableTablesQuerySchema = z.object({
  bookingDate: z.coerce.date(),
  startTime: time,
  partySize: z.coerce.number().int().positive().max(50),
  durationMinutes: z.coerce.number().int().positive().max(600).optional(),
  roomId: queryId.optional(),
});

export const listTablesQuerySchema = z.object({
  roomId: queryId.optional(),
  minSeats: z.coerce.number().int().positive().max(50).optional(),
  includeInactive: boolFlag.optional(),
});

/* ------------------------------------------------------------------ *
 *  Réservations
 * ------------------------------------------------------------------ */

const bookingBaseShape = {
  roomNumber: shortText(1, 20).optional(),
  bookingDate: z.coerce.date(),
  startTime: time,
  notes: longText(500).optional(),
};

export const createRestaurantBookingSchema = z.object({
  ...bookingBaseShape,
  tableId: dbId.optional(),
  partySize: z.number().int().positive().max(50),
  durationMinutes: z.number().int().positive().max(600).optional(),
  occasion: z.string().trim().max(80).optional(),
  preferences: longText(500).optional(),
});

export const createSpaBookingSchema = z.object({
  ...bookingBaseShape,
  itemId: dbId,
  therapistId: dbId.optional(),
  genderPreference: z.enum(GENDER_PREFERENCES).optional(),
});

export const createGenericBookingSchema = z.object({
  ...bookingBaseShape,
  domain: z.enum(GENERIC_BOOKING_DOMAINS),
  itemId: dbId.optional(),
  partySize: z.number().int().positive().max(200).optional(),
  durationMinutes: z.number().int().positive().max(600).optional(),
});

export const listBookingsQuerySchema = paginationSchema.extend({
  status: z.enum(SERVICE_BOOKING_STATUSES).optional(),
  date: z.coerce.date().optional(),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
  mine: boolFlag.optional(),
});

/** Le routeur générique est le seul à accepter un filtre `domain`, et il est borné. */
export const listGenericBookingsQuerySchema = listBookingsQuerySchema.extend({
  domain: z.enum(GENERIC_BOOKING_DOMAINS).optional(),
});

export const updateBookingStatusSchema = z.object({
  status: z.enum(SERVICE_BOOKING_STATUSES),
  message: longText(300).optional(),
  cancelReason: longText(300).optional(),
});

export const assignTherapistSchema = z.object({
  therapistId: dbId,
  message: longText(300).optional(),
});

/* ------------------------------------------------------------------ *
 *  SPA
 * ------------------------------------------------------------------ */

export const createTherapistSchema = z.object({
  firstName: shortText(1, 60),
  lastName: shortText(1, 60),
  gender: z.enum(THERAPIST_GENDERS),
  photo: z.string().trim().max(500).optional(),
});

export const updateTherapistSchema = createTherapistSchema
  .partial()
  .extend({ isActive: z.boolean().optional() });

export const listTherapistsQuerySchema = z.object({
  gender: z.enum(THERAPIST_GENDERS).optional(),
  treatmentId: queryId.optional(),
  includeInactive: boolFlag.optional(),
});

export const createTreatmentSchema = z.object({
  itemId: dbId,
  genderPreference: z.enum(GENDER_PREFERENCES).optional(),
  allowTherapistChoice: z.boolean().optional(),
  therapistIds: idList.optional(),
});

export const updateTreatmentSchema = z.object({
  genderPreference: z.enum(GENDER_PREFERENCES).optional(),
  allowTherapistChoice: z.boolean().optional(),
  therapistIds: idList.optional(),
});

/* ------------------------------------------------------------------ *
 *  Types inférés — les services et contrôleurs n'utilisent que ceux-là
 * ------------------------------------------------------------------ */

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
export type ListCategoriesQuery = z.infer<typeof listCategoriesQuerySchema>;

export type CreateItemInput = z.infer<typeof createItemSchema>;
export type UpdateItemInput = z.infer<typeof updateItemSchema>;
export type ListItemsQuery = z.infer<typeof listItemsQuerySchema>;

export type CreateOptionInput = z.infer<typeof createOptionSchema>;
export type UpdateOptionInput = z.infer<typeof updateOptionSchema>;
export type CreateSupplementInput = z.infer<typeof createSupplementSchema>;
export type UpdateSupplementInput = z.infer<typeof updateSupplementSchema>;

export type CreateSlotInput = z.infer<typeof createSlotSchema>;
export type UpdateSlotInput = z.infer<typeof updateSlotSchema>;
export type ListSlotsQuery = z.infer<typeof listSlotsQuerySchema>;

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type ListOrdersQuery = z.infer<typeof listOrdersQuerySchema>;
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;

export type CreateRoomInput = z.infer<typeof createRoomSchema>;
export type UpdateRoomInput = z.infer<typeof updateRoomSchema>;
export type IncludeInactiveQuery = z.infer<typeof includeInactiveQuerySchema>;
export type AvailableTablesQuery = z.infer<typeof availableTablesQuerySchema>;
export type CreateTableInput = z.infer<typeof createTableSchema>;
export type UpdateTableInput = z.infer<typeof updateTableSchema>;
export type ListTablesQuery = z.infer<typeof listTablesQuerySchema>;

export type CreateRestaurantBookingInput = z.infer<typeof createRestaurantBookingSchema>;
export type CreateSpaBookingInput = z.infer<typeof createSpaBookingSchema>;
export type CreateGenericBookingInput = z.infer<typeof createGenericBookingSchema>;
export type ListBookingsQuery = z.infer<typeof listBookingsQuerySchema>;
export type ListGenericBookingsQuery = z.infer<typeof listGenericBookingsQuerySchema>;
export type UpdateBookingStatusInput = z.infer<typeof updateBookingStatusSchema>;
export type AssignTherapistInput = z.infer<typeof assignTherapistSchema>;

export type CreateTherapistInput = z.infer<typeof createTherapistSchema>;
export type UpdateTherapistInput = z.infer<typeof updateTherapistSchema>;
export type ListTherapistsQuery = z.infer<typeof listTherapistsQuerySchema>;
export type CreateTreatmentInput = z.infer<typeof createTreatmentSchema>;
export type UpdateTreatmentInput = z.infer<typeof updateTreatmentSchema>;