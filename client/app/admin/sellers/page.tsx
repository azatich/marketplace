"use client";

import { useSellers } from "@/features/admin/hooks/useSellers";
import { useClients } from "@/features/admin/hooks/useClients";
import { UsersTable } from "@/features/admin/ui/users-table";
import { getUsersByRole } from "@/lib/getUsersByRole";

const Sellers = () => {
  const { data: sellers = [], isPending, isError } = useSellers();
  console.log(sellers);
  

  if (isPending) {
    return <div>Загрузка...</div>;
  }

  if (isError) {
    return <div>Ошибка при загрузке продавцов.</div>;
  }

  return (
    <div>
      <h2 className="text-xl my-4">Продавцы</h2>
      <UsersTable data={sellers} />
    </div>
  );
};
export default Sellers;
