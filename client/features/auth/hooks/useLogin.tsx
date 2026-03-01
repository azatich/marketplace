import { useMutation } from "@tanstack/react-query";
import { api } from "../../../lib/api";
import { LoginRequest } from "../types";
import Cookies from 'js-cookie'

export const useLogin = () => {
  return useMutation({
    mutationFn: async (data: LoginRequest) => {
      const res = await api.post("/auth/login", data);
      const token = res.data.token;
      
      if (token) {
        Cookies.set('token', token, { expires: 7, path: '/' });
      }
      
      return res.data;
    },
    
  });
};
