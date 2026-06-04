export interface Role {
  id: number;
  name: string;
  code: string;
  description?: string;
}

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  isActive: boolean;
  createdAt: string;
  role: Role;
}