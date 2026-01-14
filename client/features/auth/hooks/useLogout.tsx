'use client'

import { useMutation } from "@tanstack/react-query";
import { api } from "../../../lib/api";
import { useRouter } from "next/navigation";
import { showErrorToast, showSuccessToast } from "@/lib/toasts";

export const useLogout = () => {
  const router = useRouter();

  return useMutation({
    mutationFn: async () => {
      const res = await api.post("/auth/logout");
      return res.data;
    },
    onSuccess: () => {
      router.push("/login");
      showSuccessToast("Вы успешно вышли из системы");
    },
    onError: (error) => {
      console.log("Logout error: ", error);
      showErrorToast("Ошибка при выходе из системы");
    },
  });
};
