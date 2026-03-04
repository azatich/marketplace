import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/app/shared/lib/api";
import { showErrorToast, showSuccessToast } from "@/app/shared/lib/toasts";

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