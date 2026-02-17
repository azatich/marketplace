import { api } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

export const useSellerOrders = () => {
  return useQuery({
    queryKey: ["seller-orders"],
    queryFn: async () => {
      const res = await api.get("/order/seller-orders");
      return res.data;
    },
  });
};
