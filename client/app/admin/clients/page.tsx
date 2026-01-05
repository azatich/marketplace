"use client";

import { Spinner } from "@/components/ui/spinner";
import { baseUserColumns, useClients, User, UsersTable } from "@/features/admin";

const Clients = () => {
  const { data: clients = [], isPending, isError } = useClients();

  if (isPending) {
    return (
      <div className="fixed inset-0 flex justify-center items-center z-50">
        <Spinner className="size-16" />
      </div>
    );
  }

  if (isError) {
    return <div>Ошибка при загрузке клиентов.</div>;
  }

  return (
    <div>
      <h2 className="text-xl my-4">Клиенты</h2>
      <UsersTable<User> data={clients} columns={baseUserColumns} />
    </div>
  );
};
export default Clients;
