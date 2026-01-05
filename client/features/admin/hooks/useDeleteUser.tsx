import { api } from "@/lib/api"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

export const useDeleteUser = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (userId: string) => {
            const res = await api.delete(`/users/${userId}`)
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['clients']});
            queryClient.invalidateQueries({ queryKey: ['sellers']});
            toast.success('Пользователь успешно удален')
        },
        onError: () => {
            toast.error('Не удалось удалить пользователя')
        }
    })
}