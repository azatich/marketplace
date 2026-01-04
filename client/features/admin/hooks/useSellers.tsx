import { api } from "@/lib/api"
import { useQuery } from "@tanstack/react-query"

export const useSellers = () => {
    return useQuery({
        queryKey: ['sellers'],
        queryFn: async () => {
            const res = await api.get('/users/sellers')
            return res.data?.data;
        }
    })
}