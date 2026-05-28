import {
  Request,
  Response,
  NextFunction,
} from 'express';

import * as priorityService
  from '../services/priorityService';

import { success } from '../utils/response';

import { z } from 'zod';

const createSchema = z.object({
  name: z.string().min(2),

  code: z.string().min(2),

  sortOrder: z.coerce
    .number()
    .int()
    .optional(),

  slaHours: z.coerce
    .number()
    .int()
    .positive()
    .optional(),
});

const updateSchema =
  createSchema.partial();

export const create = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const data =
      createSchema.parse(req.body);

    const priority =
      await priorityService.createPriority(
        data
      );

    return success(
      res,
      priority,
      'Priorité créée',
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
    const priorities =
      await priorityService.listPriorities();

    return success(res, priorities);

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
    const priority =
      await priorityService.getPriorityById(
        Number(req.params.id)
      );

    return success(res, priority);

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
    const data =
      updateSchema.parse(req.body);

    const priority =
      await priorityService.updatePriority(
        Number(req.params.id),
        data
      );

    return success(
      res,
      priority,
      'Priorité mise à jour'
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
    await priorityService.deletePriority(
      Number(req.params.id)
    );

    return success(
      res,
      null,
      'Priorité supprimée'
    );

  } catch (err) {
    next(err);
  }
};