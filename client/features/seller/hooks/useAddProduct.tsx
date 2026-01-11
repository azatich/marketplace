import { useMutation } from "@tanstack/react-query";
import { api } from "../../../lib/api";
import { AddProductRequest } from "../types";

export const useAddProduct = () => {
  return useMutation({
    mutationFn: async (data: AddProductRequest) => {
      const res = await api.post("/seller/products", data);
      return res.data;
    },
  });
};

