import { User, UserRole } from "@/features/admin/types";

export function getUsersByRole(users: User[] = [], role: UserRole): User[] {
  return users.filter((user) => user.role === role);
}
