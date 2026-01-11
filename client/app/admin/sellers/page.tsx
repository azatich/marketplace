"use client";

import { Spinner } from "@/components/ui/spinner";
import { sellersColumns, User, UsersTable, useSellers } from "@/features/admin";

const Sellers = () => {
  const { data: sellers = [], isPending, isError } = useSellers();
  if (isPending) {
    return (
      <div className="fixed inset-0 flex justify-center items-center z-50">
        <Spinner className="size-16" />
      </div>
    );
  }

  if (isError) {
    return <div>Ошибка при загрузке продавцов.</div>;
  }

  return (
    <div>
      <h2 className="text-xl my-4">Продавцы</h2>
      <UsersTable<User> data={sellers} columns={sellersColumns} />
    </div>
  );
};
export default Sellers;
