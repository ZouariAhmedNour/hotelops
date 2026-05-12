import { NextFunction } from "express";
import { Request, Response } from "express";
import * as authService from '../services/authService';
import { z } from "zod";
import { success } from "../utils/response";

// ================= SCHEMAS =================
const registerSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
  phone: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

// 🔹 Type pour req.user
interface AuthRequest extends Request {
  user?: {
    userId: number;
  };
}

// ================= REGISTER =================
export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    console.log(req.body);
    const data = registerSchema.parse(req.body);
    const user = await authService.register(data);

    return success(res, user, 'Compte créé avec succès', 201);
  } catch (err) {
    next(err);
  }
};

// ================= LOGIN =================
export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const data = loginSchema.parse(req.body);
    const result = await authService.login(data);

    return success(res, result, 'Connexion réussie');
  } catch (err) {
    next(err);
  }
};

// ================= GET ME =================
export const getMe = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw Object.assign(new Error('Non authentifié'), { statusCode: 401 });
    }

    const user = await authService.getMe(req.user.userId);

    return success(res, user);
  } catch (err) {
    next(err);
  }
};