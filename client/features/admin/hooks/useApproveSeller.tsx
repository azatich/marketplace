import { api } from "@/lib/api"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner";

export const useApproveSeller = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (userId: string) => {
            const res = await api.patch(`/users/approve-seller/${userId}`, { userId })
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['sellers'] });
            toast.success("Продавец одобрен успешно");
        },
        onError: () => {
            toast.error("Не удалось одобрить продавца");
        }
    })
}