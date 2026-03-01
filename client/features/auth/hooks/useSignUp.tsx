import { useMutation } from "@tanstack/react-query";
import { api } from "../../../lib/api";
import { SignupRequest } from "../types";
import Cookies from "js-cookie";

export const useSignUp = () => {
  return useMutation({
    mutationFn: async (data: SignupRequest) => {
      const res = await api.post("/auth/signup", data);
      return res.data;
    },
    onSuccess: (data) => {
      if (data.token) {
        Cookies.set("token", data.token, { expires: 7, path: "/" });
      }
    },
  });
};
