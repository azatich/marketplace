import { api } from "@/lib/api"
import { useMutation } from "@tanstack/react-query"
import { OrderRequest } from "../types"
import { showErrorToast, showSuccessToast } from "@/lib/toasts"

export const useCreateOrder = () => {
    return useMutation({
        mutationFn: async (data: OrderRequest) => {
            const res = await api.post('/order/create-order', data)
            return res.data
        },
        onSuccess: () => {
            showSuccessToast('Заказ успешно оформлен')
        },
        onError: (error: any) => {
            showErrorToast('Ошибка', error?.response?.data?.message || 'Не удалось оформить заказ')
        }
    })
}