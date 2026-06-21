import { NextFunction, Request, Response } from "express";
import { z } from "zod";

import * as locationService from "../services/locationService";
import { success } from "../utils/response";

const locationTypeSchema = z.enum([
  "ROOM",
  "FLOOR",
  "COMMON_AREA",
  "SERVICE_AREA",
  "OUTDOOR",
  "PARKING",
  "OTHER",
]);

const locationAssetSchema = z.object({
  assetId: z.coerce.number().int().positive(),
  quantity: z.coerce.number().int().positive().optional(),
  label: z.string().max(150).optional(),
  notes: z.string().max(2000).optional(),
  isActive: z.boolean().optional(),
});

const createSchema = z.object({
  name: z.string().min(2),
  code: z.string().min(2),
  type: locationTypeSchema,
  zone: z.string().optional(),
  floor: z.string().optional(),
  roomNumber: z.string().optional(),
  description: z.string().optional(),
  isActive: z.boolean().optional(),
  assets: z.array(locationAssetSchema).max(100).optional(),
});

const updateSchema = createSchema.partial();

export const create = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const data = createSchema.parse(req.body);

    const location = await locationService.createLocation(data);

    return success(res, location, "Endroit créé avec succès", 201);
  } catch (error) {
    next(error);
  }
};

export const list = async (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const locations = await locationService.listLocations();

    return success(res, locations);
  } catch (error) {
    next(error);
  }
};

export const getOne = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const location = await locationService.getLocationById(
      Number(req.params.id)
    );

    return success(res, location);
  } catch (error) {
    next(error);
  }
};

export const update = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const data = updateSchema.parse(req.body);

    const location = await locationService.updateLocation(
      Number(req.params.id),
      data
    );

    return success(res, location, "Endroit mis à jour avec succès");
  } catch (error) {
    next(error);
  }
};

export const remove = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    await locationService.deleteLocation(Number(req.params.id));

    return success(res, null, "Endroit supprimé avec succès");
  } catch (error) {
    next(error);
  }
};