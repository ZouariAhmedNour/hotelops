import dotenv from 'dotenv';
import { SignOptions } from 'jsonwebtoken';

dotenv.config();

export const port = Number(process.env.PORT) || 3000;

export const jwtSecret: string =
  process.env.JWT_SECRET || 'default_secret';

export const jwtExpiresIn: SignOptions['expiresIn'] =
  (process.env.JWT_EXPIRES_IN as SignOptions['expiresIn']) || '7d';

export const nodeEnv = process.env.NODE_ENV || 'development';
export const uploadDir = process.env.UPLOAD_DIR || 'uploads';