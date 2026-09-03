// src/controllers/serviceCategoryController.ts
import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import * as serviceCategoryService from '../services/serviceCategoryService';
import {
  createCategorySchema,
  listCategoriesQuerySchema,
  updateCategorySchema,
} from '../validators/serviceValidators';
import { parseBody, parseId, parseQuery } from '../utils/validate';
import { isStaffView } from '../utils/requestUser';
import { success } from '../utils/response';

export async function list(req: AuthRequest, res: Response): Promise<void> {
  const query = parseQuery(listCategoriesQuerySchema, req.query);
  // `includeInactive` est réservé au personnel : un client ne doit pas voir
  // le catalogue non publié.
  const categories = await serviceCategoryService.listCategories({
    ...query,
    includeInactive: isStaffView(req) && query.includeInactive,
  });
  success(res, categories);
}

export async function getById(req: AuthRequest, res: Response): Promise<void> {
  const category = await serviceCategoryService.getCategoryById(
    parseId(req.params.id),
    isStaffView(req),
  );
  success(res, category);
}

export async function create(req: AuthRequest, res: Response): Promise<void> {
  const data = parseBody(createCategorySchema, req.body);
  const category = await serviceCategoryService.createCategory(data);
  success(res, category, 'Catégorie créée', 201);
}

export async function update(req: AuthRequest, res: Response): Promise<void> {
  const data = parseBody(updateCategorySchema, req.body);
  const category = await serviceCategoryService.updateCategory(parseId(req.params.id), data);
  success(res, category, 'Catégorie mise à jour');
}

export async function remove(req: AuthRequest, res: Response): Promise<void> {
  const category = await serviceCategoryService.deactivateCategory(parseId(req.params.id));
  success(res, category, 'Catégorie désactivée');
}

export async function restore(req: AuthRequest, res: Response): Promise<void> {
  const category = await serviceCategoryService.reactivateCategory(parseId(req.params.id));
  success(res, category, 'Catégorie réactivée');
}