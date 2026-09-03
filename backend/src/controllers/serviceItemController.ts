// src/controllers/serviceItemController.ts
import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import * as serviceItemService from '../services/serviceItemService';
import {
  createItemSchema,
  createOptionSchema,
  createSlotSchema,
  createSupplementSchema,
  listItemsQuerySchema,
  listSlotsQuerySchema,
  updateItemSchema,
  updateOptionSchema,
  updateSlotSchema,
  updateSupplementSchema,
} from '../validators/serviceValidators';
import { parseBody, parseId, parseQuery } from '../utils/validate';
import { isStaffView } from '../utils/requestUser';
import { success } from '../utils/response';
import { unprocessable } from '../utils/appError';
import { uploadDir } from '../config/env';
import z from 'zod';

/* Articles ---------------------------------------------------------- */

export async function list(req: AuthRequest, res: Response): Promise<void> {
  const query = parseQuery(listItemsQuerySchema, req.query);
  const result = await serviceItemService.listItems({
    ...query,
    includeInactive: isStaffView(req) && query.includeInactive,
  });
  success(res, result);
}

export async function getById(req: AuthRequest, res: Response): Promise<void> {
  const item = await serviceItemService.getItemById(parseId(req.params.id), isStaffView(req));
  success(res, item);
}

export async function create(req: AuthRequest, res: Response): Promise<void> {
  const data = parseBody(createItemSchema, req.body);
  const item = await serviceItemService.createItem(data);
  success(res, item, 'Article créé', 201);
}

export async function update(req: AuthRequest, res: Response): Promise<void> {
  const data = parseBody(updateItemSchema, req.body);
  const item = await serviceItemService.updateItem(parseId(req.params.id), data);
  success(res, item, 'Article mis à jour');
}

export async function remove(req: AuthRequest, res: Response): Promise<void> {
  const item = await serviceItemService.deactivateItem(parseId(req.params.id));
  success(res, item, 'Article désactivé');
}

/* Options ----------------------------------------------------------- */

export async function addOption(req: AuthRequest, res: Response): Promise<void> {
  const data = parseBody(createOptionSchema, req.body);
  const option = await serviceItemService.addOption(data);
  success(res, option, 'Option ajoutée', 201);
}

export async function updateOption(req: AuthRequest, res: Response): Promise<void> {
  const data = parseBody(updateOptionSchema, req.body);
  const option = await serviceItemService.updateOption(parseId(req.params.optionId), data);
  success(res, option, 'Option mise à jour');
}

export async function removeOption(req: AuthRequest, res: Response): Promise<void> {
  const option = await serviceItemService.removeOption(parseId(req.params.optionId));
  success(res, option, 'Option désactivée');
}

/* Suppléments ------------------------------------------------------- */

export async function addSupplement(req: AuthRequest, res: Response): Promise<void> {
  const data = parseBody(createSupplementSchema, req.body);
  const supplement = await serviceItemService.addSupplement(data);
  success(res, supplement, 'Supplément ajouté', 201);
}

export async function updateSupplement(req: AuthRequest, res: Response): Promise<void> {
  const data = parseBody(updateSupplementSchema, req.body);
  const supplement = await serviceItemService.updateSupplement(
    parseId(req.params.supplementId),
    data,
  );
  success(res, supplement, 'Supplément mis à jour');
}

export async function removeSupplement(req: AuthRequest, res: Response): Promise<void> {
  const supplement = await serviceItemService.removeSupplement(parseId(req.params.supplementId));
  success(res, supplement, 'Supplément désactivé');
}

/* Créneaux ---------------------------------------------------------- */

export async function listSlots(req: AuthRequest, res: Response): Promise<void> {
  const query = parseQuery(listSlotsQuerySchema, req.query);
  const slots = await serviceItemService.listSlots({
    ...query,
    includeInactive: isStaffView(req) && query.includeInactive,
  });
  success(res, slots);
}

export async function addSlot(req: AuthRequest, res: Response): Promise<void> {
  const data = parseBody(createSlotSchema, req.body);
  const slot = await serviceItemService.addSlot(data);
  success(res, slot, 'Créneau ajouté', 201);
}

export async function updateSlot(req: AuthRequest, res: Response): Promise<void> {
  const data = parseBody(updateSlotSchema, req.body);
  const slot = await serviceItemService.updateSlot(parseId(req.params.slotId), data);
  success(res, slot, 'Créneau mis à jour');
}

export async function removeSlot(req: AuthRequest, res: Response): Promise<void> {
  await serviceItemService.removeSlot(parseId(req.params.slotId));
  success(res, null, 'Créneau supprimé');
}

export async function addPhoto(req: AuthRequest, res: Response): Promise<void> {
  if (!req.file) throw unprocessable('Aucun fichier reçu');
  const url = `/${uploadDir}/${req.file.filename}`;
  const item = await serviceItemService.addPhoto(parseId(req.params.id), url);
  success(res, item, 'Photo ajoutée', 201);
}

export async function removePhoto(req: AuthRequest, res: Response): Promise<void> {
  const data = parseBody(z.object({ url: z.string() }), req.body);
  const item = await serviceItemService.removePhoto(parseId(req.params.id), data.url);
  success(res, item, 'Photo supprimée');
}