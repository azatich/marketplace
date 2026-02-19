import { api } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { SellerOrderItem } from "../types";

export const useSellerOrders = () => {
  return useQuery<SellerOrderItem[]>({
    queryKey: ["seller-orders"],
    queryFn: async () => {
      const res = await api.get("/order/seller-orders");
      return res.data;
    },
  });
};
