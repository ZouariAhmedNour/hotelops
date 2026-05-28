import { Request, Response, NextFunction } from 'express';
import * as ticketService from '../services/ticketService';
import { success } from '../utils/response';
import { z } from 'zod';

interface AuthRequest extends Request {
  user?: {
    userId: number;
  };
}

const createSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(5),

  locationId: z.coerce.number().int().positive(),
  categoryId: z.coerce.number().int().positive(),
  priorityId: z.coerce.number().int().positive(),

  reportedFrom: z.string().optional(),

  urgencyLevel: z.coerce.number().int().min(1).max(5).optional(),
});

export const create = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw Object.assign(
        new Error('Non authentifié'),
        { statusCode: 401 }
      );
    }

    const data = createSchema.parse(req.body);

    const files =
      (req.files as Express.Multer.File[]) || [];

    const ticket = await ticketService.createTicket(
      data,
      req.user.userId,
      files
    );

    return success(
      res,
      ticket,
      'Ticket créé',
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
    const result = await ticketService.listTickets(
      req.query as any
    );

    return success(res, result);

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
    const ticket =
      await ticketService.getTicketById(
        Number(req.params.id)
      );

    return success(res, ticket);

  } catch (err) {
    next(err);
  }
};

export const assign = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw Object.assign(
        new Error('Non authentifié'),
        { statusCode: 401 }
      );
    }

    const ticket =
      await ticketService.assignTicket(
        Number(req.params.id),
        Number(req.body.assignedToUserId),
        req.user.userId,
        req.body.note
      );

    return success(
      res,
      ticket,
      'Ticket assigné'
    );

  } catch (err) {
    next(err);
  }
};

export const changeStatus = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw Object.assign(
        new Error('Non authentifié'),
        { statusCode: 401 }
      );
    }

    const ticket =
      await ticketService.changeStatus(
        Number(req.params.id),
        req.body.statusCode,
        req.user.userId
      );

    return success(
      res,
      ticket,
      'Statut mis à jour'
    );

  } catch (err) {
    next(err);
  }
};