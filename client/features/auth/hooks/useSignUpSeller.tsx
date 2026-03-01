import { useMutation } from "@tanstack/react-query";
import { api } from "../../../lib/api";
import { SellerFormData } from "../types";

export const useSignUpSeller = () => {
  return useMutation({
    mutationFn: async (data: SellerFormData) => {
      const res = await api.post("/auth/signup-seller", data);
      return res.data;
    },
  });
};
