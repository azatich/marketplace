"use client";

import { Button } from "../../components/ui/button";
import { useLogout } from "../../features/auth";

const Logout = () => {
  const { mutate, isPending } = useLogout();

  return (
    <Button onClick={() => mutate()} disabled={isPending}>
      {isPending ? 'Выходим...' : 'Выйти'}
    </Button>
  );
};

export default Logout;
