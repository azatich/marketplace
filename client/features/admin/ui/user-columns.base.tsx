import { ColumnDef } from "@tanstack/react-table";
import { User } from "@/features/admin/types/index";
import { UserActions } from "./user-actions";

export const baseUserColumns: ColumnDef<User>[] = [
  {
    accessorKey: "first_name",
    header: "Имя",
  },
  {
    accessorKey: "last_name",
    header: "Фамилия",
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "created_at",
    header: "Создан",
    cell: ({ getValue }) => new Date(getValue<string>()).toLocaleDateString(),
  },
  {
    id: "actions",
    header: "",
    cell: ({ row }) => <UserActions user={row.original} />,
  },
];
