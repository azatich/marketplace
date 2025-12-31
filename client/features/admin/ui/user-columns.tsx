import { ColumnDef } from "@tanstack/react-table";
import { User } from "@/features/admin/types/index";
import { UserActions } from "./user-actions";

export const userColumns: ColumnDef<User>[] = [
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
    accessorKey: "role",
    header: "Роль",
    cell: ({ getValue }) => (
      <span className="px-2 py-1 rounded bg-white/10 text-sm">
        {getValue<string>()}
      </span>
    ),
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
