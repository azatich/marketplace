import { ColumnDef } from "@tanstack/react-table";
import { User } from "../types";
import { baseUserColumns } from "./user-columns.base";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, CheckCircle, XCircle, Clock } from "lucide-react";
import { useApproveSeller, useDeleteUser, useRejectSeller } from "@/features/admin";

const SellerActions = ({ user }: { user: User }) => {
  const approveSeller = useApproveSeller();
  const rejectSeller = useRejectSeller();
  const deleteUser = useDeleteUser();

  const isApproved = user.sellers?.approved;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Открыть меню</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() => {
            approveSeller.mutate(user.id);
          }}
          disabled={isApproved}
        >
          <CheckCircle className="mr-2 h-4 w-4" />
          Одобрить
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => {
            rejectSeller.mutate(user.id);
          }}
          disabled={!isApproved}
        >
          <XCircle className="mr-2 h-4 w-4" />
          Отклонить
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => {
            // Просмотр деталей
            console.log("Просмотр деталей:", user.id);
          }}
        >
          Просмотр деталей
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => {
            console.log("Редактировать:", user.id);
          }}
        >
          Редактировать
        </DropdownMenuItem>
        <DropdownMenuItem
          className="text-red-600"
          onClick={() => {
            deleteUser.mutate(user.id);
          }}
        >
          Удалить
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export const sellersColumns: ColumnDef<User>[] = [
  ...baseUserColumns.slice(0, 4),
  {
    accessorKey: "approved",
    header: "Статус",
    cell: ({ row }) => {
      const isApproved = row.original.sellers?.approved;

      return (
        <Badge variant={isApproved ? "default" : "secondary"} className="gap-1">
          {isApproved ? (
            <>
              <CheckCircle className="w-3 h-3" />
              Одобрен
            </>
          ) : (
            <>
              <Clock className="w-3 h-3" />
              Не одобрен
            </>
          )}
        </Badge>
      );
    },
  },
  {
    id: "approve-actions",
    header: "Действия",
    cell: ({ row }) => <SellerActions user={row.original} />,
  },
];
