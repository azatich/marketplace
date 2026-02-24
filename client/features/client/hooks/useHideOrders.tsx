import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { showErrorToast, showSuccessToast } from "@/lib/toasts";

export const useHideOrders = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (orderIds: string[]) => {
      const res = await api.post("/order/client-orders/hide", { orderIds });
      return res.data;
    },
    onSuccess: () => {
      showSuccessToast("Заказы удалены из истории");
      queryClient.invalidateQueries({ queryKey: ["clientOrders"] });
    },
    onError: () => {
      showErrorToast("Ошибка при удалении");
    },
  });
};