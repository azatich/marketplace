"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { showErrorToast, showSuccessToast } from "@/lib/toasts";

interface HandleCancellationPayload {
  orderItemId: string; // ID товара, пойдет в URL
  action: 'approve_client' | 'reject_client' | 'cancel_by_seller';
  reason?: string; // Причина (нужна только если продавец сам отменяет)
}

export const useHandleCancellation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ orderItemId, action, reason }: HandleCancellationPayload) => {
      // Подставляем orderItemId в URL, а action и reason передаем в теле запроса
      const res = await api.post(`/seller/products/handle-cancellation/${orderItemId}`, { 
        action, 
        reason 
      });
      return res.data;
    },
    onSuccess: (_, variables) => {
      // Показываем разные уведомления в зависимости от действия
      if (variables.action === 'approve_client') {
        showSuccessToast("Вы одобрили отмену заказа");
      } else if (variables.action === 'reject_client') {
        showSuccessToast("Отмена отклонена, заказ возвращен в работу");
      } else {
        showSuccessToast("Заказ успешно отменен");
      }
      
      // Обновляем список заказов продавца и статистику на дэшборде
      queryClient.invalidateQueries({ queryKey: ["seller-orders"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardStats"] }); 
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || "Произошла ошибка при обработке";
      showErrorToast(message);
    },
  });
};