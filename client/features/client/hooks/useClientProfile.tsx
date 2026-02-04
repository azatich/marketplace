import { api } from "@/lib/api"
import { useQuery } from "@tanstack/react-query"

export const useClientProfile = () => {
    return useQuery({
        queryKey: ["clientProfile"],
        queryFn: async () => {
            const res = await api.get('/auth/me')
            return res.data;
        }
    })
}