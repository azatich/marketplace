export enum UserRole {
  ADMIN = 'admin',
  SELLER = 'seller',
  CLIENT = 'client'
}

export interface SignUpResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
}