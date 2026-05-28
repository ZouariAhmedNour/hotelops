import { Request, Response, NextFunction } from 'express';
import * as locationService from '../services/locationService';
import { success } from '../utils/response';
import { z } from 'zod';

const createSchema = z.object({
  name: z.string().min(2),

  type: z.string().min(2),

  parentId: z.coerce.number().int().positive().optional(),

  hotelId: z.coerce.number().int().positive().optional(),

  code: z.string().optional(),

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

    const location =
      await locationService.createLocation(data);

    return success(
      res,
      location,
      'Location créée',
      201
    );

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
    const locations =
      await locationService.listLocations();

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
    const location =
      await locationService.getLocationById(
        Number(req.params.id)
      );

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

    const location =
      await locationService.updateLocation(
        Number(req.params.id),
        data
      );

    return success(
      res,
      location,
      'Location mise à jour'
    );

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
    await locationService.deleteLocation(
      Number(req.params.id)
    );

    return success(
      res,
      null,
      'Location supprimée'
    );

  } catch (err) {
    next(err);
  }
};