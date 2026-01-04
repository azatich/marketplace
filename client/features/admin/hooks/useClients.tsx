import { api } from "@/lib/api"
import { useQuery } from "@tanstack/react-query"

export const useClients = () => {
    return useQuery({
        queryKey: ['users'],
        queryFn: async () => {
            const res = await api.get('/users/clients');
            return res.data?.data;
        }
    })
}