export type UserRole = "client" | "seller" | "admin";

export type User = {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  created_at: string;
};
