import { api } from "@/lib/api"
import { useQuery } from "@tanstack/react-query"

export const useUsers = () => {
    return useQuery({
        queryKey: ['users'],
        queryFn: async () => {
            const res = await api.get('/users')
            return res.data?.data;
        }
    })
}