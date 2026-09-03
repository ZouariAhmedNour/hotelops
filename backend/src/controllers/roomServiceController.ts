// src/controllers/roomServiceController.ts
import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import * as roomServiceService from '../services/roomServiceService';
import {
  createOrderSchema,
  listOrdersQuerySchema,
  updateOrderStatusSchema,
} from '../validators/serviceValidators';
import { parseBody, parseId, parseQuery } from '../utils/validate';
import { currentUserId } from '../utils/requestUser';
import { success } from '../utils/response';

export async function create(req: AuthRequest, res: Response): Promise<void> {
  const data = parseBody(createOrderSchema, req.body);
  const order = await roomServiceService.createOrder(data, currentUserId(req));
  success(res, order, 'Commande créée', 201);
}

export async function list(req: AuthRequest, res: Response): Promise<void> {
  const query = parseQuery(listOrdersQuerySchema, req.query);
  const result = await roomServiceService.listOrders(query, currentUserId(req));
  success(res, result);
}

export async function getById(req: AuthRequest, res: Response): Promise<void> {
  const order = await roomServiceService.getOrderById(parseId(req.params.id));
  success(res, order);
}

export async function updateStatus(req: AuthRequest, res: Response): Promise<void> {
  const data = parseBody(updateOrderStatusSchema, req.body);
  const order = await roomServiceService.updateOrderStatus({
    id: parseId(req.params.id),
    status: data.status,
    userId: currentUserId(req),
    message: data.message,
    cancelReason: data.cancelReason,
  });
  success(res, order, `Commande passée en ${data.status}`);
}

export async function markPaid(req: AuthRequest, res: Response): Promise<void> {
  const order = await roomServiceService.markOrderPaid(parseId(req.params.id));
  success(res, order, 'Commande marquée comme réglée');
}