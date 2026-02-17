"use client";

import { useLogout } from "@/features/seller/ui/auth";
import { Button } from "./ui/button";

const LogoutButton = () => {
  const { mutate, isPending } = useLogout();

  return (
    <Button className="bg-red-500 hover:bg-red-900 transition-colors duration-200" onClick={() => mutate()} disabled={isPending}>
      {isPending ? 'Выходим...' : 'Выйти'}
    </Button>
  );
};

export default LogoutButton;
