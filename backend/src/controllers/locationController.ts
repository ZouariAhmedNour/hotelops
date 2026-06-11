import { Request, Response, NextFunction } from "express";
import * as locationService from "../services/locationService";
import { success } from "../utils/response";
import { z } from "zod";

const locationTypeSchema = z.enum([
  "ROOM",
  "FLOOR",
  "COMMON_AREA",
  "SERVICE_AREA",
  "OUTDOOR",
  "PARKING",
  "OTHER",
]);

const createSchema = z.object({
  name: z.string().min(2),
  code: z.string().min(2),
  type: locationTypeSchema,
  zone: z.string().optional(),
  floor: z.string().optional(),
  roomNumber: z.string().optional(),
  description: z.string().optional(),
  isActive: z.boolean().optional(),
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
  } catch (err) {
    next(err);
  }
};

export const list = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const locations = await locationService.listLocations();

    return success(res, locations);
  } catch (err) {
    next(err);
  }
};

export const getOne = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const location = await locationService.getLocationById(Number(req.params.id));

    return success(res, location);
  } catch (err) {
    next(err);
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
  } catch (err) {
    next(err);
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
  } catch (err) {
    next(err);
  }
};