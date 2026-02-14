import { api } from "@/lib/api"
import { useQuery } from "@tanstack/react-query"
import { Order } from "../types"

export const useClientOrders = () => {
    return useQuery<Order[]>({
        queryKey: ['clientOrders'],
        queryFn: async () => {
            const res = await api.get('/order/client-orders')
            return res.data;
        },
        staleTime: 2 * 60 * 1000,
        refetchOnWindowFocus: false,
    })
}