import { useQuery } from "@tanstack/react-query";
import { api } from "../../../lib/api";
import { Product } from "../types";

export const useProduct = (id: string) => {
  return useQuery({
    queryKey: ["product", id],
    queryFn: async () => {
      const res = await api.get(`/client/products/${id}`);
      return res.data as Product;
    },
    enabled: !!id,
  });
};

