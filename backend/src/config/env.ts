import dotenv from 'dotenv';
dotenv.config();

export const port = Number(process.env.PORT) || 3000;
export const jwtSecret = process.env.JWT_SECRET as string;
export const jwtExpiresIn = process.env.JWT_EXPIRES_IN || '7d';
export const nodeEnv = process.env.NODE_ENV || 'development';
export const uploadDir = process.env.UPLOAD_DIR || 'uploads';