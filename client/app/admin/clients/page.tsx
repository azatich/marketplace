"use client";

import { useUsers } from "@/features/admin/hooks/useUsers";
import { UsersTable } from "@/features/admin/ui/users-table";
import { getUsersByRole } from "@/lib/getUsersByRole";

const Clients = () => {
  const { data: users = [], isPending, isError } = useUsers();
  
  const clients = getUsersByRole(users, "client");

  if (isPending) {
    return <div>Загрузка...</div>;
  }

  if (isError) {
    return <div>Ошибка при загрузке клиентов.</div>;
  }

  return (
    <div>
      <h2 className="text-xl my-4">Клиенты</h2>
      <UsersTable data={clients} />
    </div>
  );
};
export default Clients;
