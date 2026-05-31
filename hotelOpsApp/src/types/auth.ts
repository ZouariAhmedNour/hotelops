export type Role = {
  id: number;
  code: string;
  name: string;
};

export type User = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  role?: Role;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type RegisterPayload = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
  roleId?: number;
};

export type AuthResponse = {
  token: string;
  user: User;
};