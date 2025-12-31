"use client";

import { useUsers } from "@/features/admin/hooks/useUsers";
import { UsersTable } from "@/features/admin/ui/users-table";
import { getUsersByRole } from "@/lib/getUsersByRole";

const Sellers = () => {
  const { data: users = [], isPending, isError } = useUsers();
  
  const sellers = getUsersByRole(users, "seller");

  if (isPending) {
    return <div>Загрузка...</div>;
  }

  if (isError) {
    return <div>Ошибка при загрузке продавцов.</div>;
  }

  return (
    <div>
      <h2 className="text-xl mb-4">Продавцы</h2>
      <UsersTable data={sellers} />
    </div>
  );
};
export default Sellers;
