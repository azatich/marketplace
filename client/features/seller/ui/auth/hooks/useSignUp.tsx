import { useMutation } from "@tanstack/react-query";
import { api } from "../../../../../lib/api";
import { SignupRequest } from "../types";

export const useSignUp = () => {
  return useMutation({
    mutationFn: async (data: SignupRequest) => {
      const res = await api.post("/auth/signup", data);
      return res.data;
    },
    onSuccess: (data) => {
      if (data.data?.token) {
        localStorage.setItem("token", data.data.token);
      }
    },
  });
};
