import {
  Request,
  Response,
  NextFunction,
} from 'express';

import * as categoryService
  from '../services/categoryService';

import { success } from '../utils/response';

import { z } from 'zod';

const createSchema = z.object({
  name: z.string().min(2),

  icon: z.string().optional(),

  isActive: z.boolean().optional(),
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

    const category =
      await categoryService.createCategory(
        data
      );

    return success(
      res,
      category,
      'Catégorie créée',
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
    const categories =
      await categoryService.listCategories();

    return success(res, categories);

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
    const category =
      await categoryService.getCategoryById(
        Number(req.params.id)
      );

    return success(res, category);

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

    const category =
      await categoryService.updateCategory(
        Number(req.params.id),
        data
      );

    return success(
      res,
      category,
      'Catégorie mise à jour'
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
    await categoryService.deleteCategory(
      Number(req.params.id)
    );

    return success(
      res,
      null,
      'Catégorie supprimée'
    );

  } catch (err) {
    next(err);
  }
};