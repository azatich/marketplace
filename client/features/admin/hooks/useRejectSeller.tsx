import { api } from "@/lib/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useRejectSeller = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (userId: string) => {
            const res = await api.patch(`/users/reject-seller/${userId}`, { userId })
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['sellers'] });
            toast.success("Продавец отклонен успешно");
        },
        onError: () => {
            toast.error("Не удалось отклонить продавца");
        }
    })
}