import { useMutation } from "@tanstack/react-query";
import React from "react";
import { api } from "../../../../../lib/api";
import { SellerFormData } from "../types";
import { toast } from "sonner";

export const useSignUpSeller = () => {
  return useMutation({
    mutationFn: async (data: SellerFormData) => {
      const res = await api.post("/auth/signup-seller", data);
      return res.data;
    },
    onSuccess: (data) => {
      if (data.data?.token) {
        localStorage.setItem("token", data.data.token);
      }
    },
  });
};
