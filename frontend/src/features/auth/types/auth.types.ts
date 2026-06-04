export interface LoginFormValues {
  email: string;
  password: string;
}

export interface SignupFormValues {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  roleId: number;
  password: string;
  confirmPassword: string;
}