import { useMutation } from "@tanstack/react-query";
import { api } from "./authApi";
import { LoginRequest } from "../types";

export const useLogin = () => {
  return useMutation({
    mutationFn: async (data: LoginRequest) => {
      const res = await api.post("/auth/login", data);
      return res.data;
    },
    onSuccess: (data) => {
      if (data.data?.token) {
        localStorage.setItem("token", data.data.token);
      }
    },
  });
};
