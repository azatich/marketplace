'use client'

import { useMutation } from "@tanstack/react-query";
import { api } from "../../../app/shared/lib/api";
import { useRouter } from "next/navigation";
import { showErrorToast, showSuccessToast } from "@/app/shared/lib/toasts";
import Cookies from "js-cookie";

export const useLogout = () => {
  const router = useRouter();

  return useMutation({
    mutationFn: async () => {
      const res = await api.post("/auth/logout");
      return res.data;
    },
    onSuccess: () => {
      Cookies.remove("token", { path: "/" });
      showSuccessToast("Вы успешно вышли из системы");
      router.push("/login");
    },
    onError: (error) => {
      console.log("Logout error: ", error);
      showErrorToast("Ошибка при выходе из системы");
    },
  });
};
