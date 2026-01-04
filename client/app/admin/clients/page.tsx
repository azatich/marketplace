"use client";

import { useClients } from "@/features/admin/hooks/useClients";
import { UsersTable } from "@/features/admin/ui/users-table";
import { getUsersByRole } from "@/lib/getUsersByRole";

const Clients = () => {
  const { data: clients = [], isPending, isError } = useClients();

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
