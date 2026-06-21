import { NextFunction, Request, Response } from "express";
import { z } from "zod";

import * as assetService from "../services/assetService";
import { success } from "../utils/response";

const assetSchema = z.object({
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères."),
  code: z.string().min(2, "Le code doit contenir au moins 2 caractères."),
  category: z.string().max(100).optional(),
  icon: z.string().max(100).optional(),
  description: z.string().max(2000).optional(),
  isActive: z.boolean().optional(),
});

const updateAssetSchema = assetSchema.partial();

const listQuerySchema = z.object({
  search: z.string().optional(),
  isActive: z.enum(["true", "false"]).optional(),
});

export const list = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const query = listQuerySchema.parse(req.query);

    const assets = await assetService.listAssets({
      search: query.search,
      isActive:
        query.isActive === undefined ? undefined : query.isActive === "true",
    });

    return success(res, assets);
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
    const asset = await assetService.getAssetById(Number(req.params.id));

    return success(res, asset);
  } catch (error) {
    next(error);
  }
};

export const create = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const data = assetSchema.parse(req.body);

    const asset = await assetService.createAsset(data);

    return success(res, asset, "Équipement créé avec succès.", 201);
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
    const data = updateAssetSchema.parse(req.body);

    const asset = await assetService.updateAsset(Number(req.params.id), data);

    return success(res, asset, "Équipement mis à jour avec succès.");
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
    const asset = await assetService.deactivateAsset(Number(req.params.id));

    return success(res, asset, "Équipement désactivé avec succès.");
  } catch (error) {
    next(error);
  }
};