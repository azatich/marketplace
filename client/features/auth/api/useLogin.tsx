import { useMutation } from "@tanstack/react-query";
import { api } from "./authApi";
import { LoginRequest } from "../types";

export const useLogin = () => {
  return useMutation({
    mutationFn: async (data: LoginRequest) => {
      const res = await api.post("/auth/login", data);
      return res.data;
    },
  });
};
