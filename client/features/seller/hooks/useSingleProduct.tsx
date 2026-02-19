import { api } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { ProductItem } from "../types";

export const useSingleProduct = (productId: string) => {
  return useQuery<ProductItem>({
    queryKey: ["seller-products", productId],
    queryFn: async () => {
      const res = await api.get(`/seller/products/${productId}`);
      return res.data;
    },
    enabled: !!productId,
  });
};
