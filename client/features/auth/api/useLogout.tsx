'use client'

import { useMutation } from "@tanstack/react-query";
import { api } from "./authApi";
import { useRouter } from "next/navigation";

export const useLogout = () => {
  const router = useRouter();

  return useMutation({
    mutationFn: async () => {
      const res = await api.post("/auth/logout");
      return res.data;
    },
    onSuccess: () => {
      router.push("/login");
    },
    onError: (error) => {
      console.log("Logout error: ", error);
    },
  });
};
