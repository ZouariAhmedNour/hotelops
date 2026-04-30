import { PrismaClient, Role, User } from "@prisma/client";
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { jwtExpiresIn, jwtSecret } from "../config/env";

const prisma = new PrismaClient();

// 🔹 Type utilisateur avec relation role
type UserWithRole = User & { role: Role };

// 🔹 Type payload JWT
interface JwtPayload {
  userId: number;
  email: string;
  roleCode: string;
}

// ================= REGISTER =================
export const register = async ({
  firstName,
  lastName,
  email,
  password,
  phone,
  roleId,
}: {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
  roleId: number;
}) => {
  const existing = await prisma.user.findUnique({ where: { email } });

  if (existing) {
    const err = new Error('Cet email est déjà utilisé') as any;
    err.statusCode = 409;
    throw err;
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: { firstName, lastName, email, passwordHash, phone, roleId },
    include: { role: true },
  });

  return sanitizeUser(user);
};

// ================= LOGIN =================
export const login = async ({
  email,
  password,
}: {
  email: string;
  password: string;
}) => {
  const user = await prisma.user.findUnique({
    where: { email },
    include: { role: true },
  });

  if (!user || !user.isActive) {
    const err = new Error('Identifiants invalides') as any;
    err.statusCode = 401;
    throw err;
  }

  const valid = await bcrypt.compare(password, user.passwordHash);

  if (!valid) {
    const err = new Error('Identifiants invalides') as any;
    err.statusCode = 401;
    throw err;
  }

const token = jwt.sign(
  {
    userId: user.id,
    email: user.email,
    roleCode: user.role.code,
  },
  jwtSecret,
  {
    expiresIn: jwtExpiresIn,
  }
);
  return {
    token,
    user: sanitizeUser(user),
  };
};

// ================= GET ME =================
export const getMe = async (userId: number) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { role: true },
  });

  if (!user) {
    const err = new Error('Utilisateur introuvable') as any;
    err.statusCode = 404;
    throw err;
  }

  return sanitizeUser(user);
};

// ================= SANITIZE =================
const sanitizeUser = (user: UserWithRole) => {
  const { passwordHash, ...safeUser } = user;
  return safeUser;
};