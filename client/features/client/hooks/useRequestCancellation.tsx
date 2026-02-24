"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { showErrorToast, showSuccessToast } from "@/lib/toasts";

interface RequestCancellationPayload {
  orderItemId: string;
  reason: string;
}

export const useRequestCancellation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: RequestCancellationPayload) => {
      // Отправляем POST запрос, данные передаем в теле (body)
      const res = await api.post("/client/request-cancellation", payload);
      return res.data;
    },
    onSuccess: () => {
      showSuccessToast("Запрос на отмену отправлен продавцу");
      // Обновляем список заказов клиента, чтобы сразу увидеть статус "Ожидает отмены"
      queryClient.invalidateQueries({ queryKey: ["clientOrders"] });
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || "Не удалось отправить запрос на отмену";
      showErrorToast(message);
    },
  });
};