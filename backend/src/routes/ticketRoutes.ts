import { Request, Response, NextFunction } from 'express';
import * as ticketService from '../services/ticketService';
import { success } from '../utils/response';
import { z } from 'zod';

// ================= TYPES =================

// 🔹 Type pour req.user (injecté par authenticate middleware)
interface AuthRequest extends Request {
  user?: {
    userId: number;
  };
}

// ================= SCHEMAS =================

const createSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(5),
  locationId: z.number().int().positive(),
  categoryId: z.number().int().positive(),
  priorityId: z.number().int().positive(),
  reportedFrom: z.string().optional(),
  urgencyLevel: z.number().int().min(1).max(5).optional(),
});

// ================= CREATE =================

export const create = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw Object.assign(new Error('Non authentifié'), { statusCode: 401 });
    }

    const data = createSchema.parse(req.body);

    const ticket = await ticketService.createTicket(
      data,
      req.user.userId
    );

    return success(res, ticket, 'Ticket créé', 201);
  } catch (err) {
    next(err);
  }
};

// ================= LIST =================

export const list = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await ticketService.listTickets(req.query);

    return success(res, result);
  } catch (err) {
    next(err);
  }
};

// ================= GET ONE =================

export const getOne = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const ticketId = Number(req.params.id);

    const ticket = await ticketService.getTicketById(ticketId);

    return success(res, ticket);
  } catch (err) {
    next(err);
  }
};

// ================= ASSIGN =================

export const assign = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw Object.assign(new Error('Non authentifié'), { statusCode: 401 });
    }

    const ticketId = Number(req.params.id);
    const assignedToUserId = Number(req.body.assignedToUserId);
    const note: string | undefined = req.body.note;

    const ticket = await ticketService.assignTicket(
      ticketId,
      assignedToUserId,
      req.user.userId,
      note
    );

    return success(res, ticket, 'Ticket assigné');
  } catch (err) {
    next(err);
  }
};

// ================= STATUS =================

export const changeStatus = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw Object.assign(new Error('Non authentifié'), { statusCode: 401 });
    }

    const ticketId = Number(req.params.id);
    const { statusCode } = req.body;

    const ticket = await ticketService.changeStatus(
      ticketId,
      statusCode,
      req.user.userId
    );

    return success(res, ticket, 'Statut mis à jour');
  } catch (err) {
    next(err);
  }
};