import { api } from "@/app/shared/lib/api"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { OrderRequest } from "../types"
import { showErrorToast, showSuccessToast } from "@/app/shared/lib/toasts"

export const useCreateOrder = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: OrderRequest) => {
            const res = await api.post('/order/create-order', data)
            return res.data
        },
        onSuccess: () => {
            showSuccessToast('Заказ успешно оформлен')
            queryClient.invalidateQueries({queryKey: ['clientOrders']})
        },
        onError: (error: any) => {
            showErrorToast('Ошибка', error?.response?.data?.message || 'Не удалось оформить заказ')
        }
    })
}