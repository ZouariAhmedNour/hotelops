import { Response } from 'express';

export const success = (
  res: Response,
  data: any,
  message = 'OK',
  statusCode = 200
) => {
  return res.status(statusCode).json({ success: true, message, data });
};

export const error = (
  res: Response,
  message = 'Erreur serveur',
  statusCode = 500,
  errors: any = null
) => {
  const payload: any = { success: false, message };
  if (errors) payload.errors = errors;
  return res.status(statusCode).json(payload);
};