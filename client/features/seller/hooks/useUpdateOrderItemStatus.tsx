import { useMutation, useQueryClient } from "@tanstack/react-query";
import { OrderItemStatus } from "../types";
import { api } from "@/lib/api";
import { showErrorToast, showSuccessToast } from "@/lib/toasts";
import { OrderItem } from "@/features/client/types";

interface UpdateStatusPayload {
  id: string;
  status: OrderItemStatus;
}

export const useUpdateOrderItemStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: UpdateStatusPayload) => {
      const res = await api.patch(`/order/status/${payload.id}`, {
        status: payload.status,
      });
      return res.data;
    },
    onMutate: async (payload: UpdateStatusPayload) => {
      await queryClient.cancelQueries({ queryKey: ["seller-orders"] });

      const previousOrders = queryClient.getQueryData(["seller-orders"]);

      queryClient.setQueryData(["seller-orders"], (old: any) => {
        if (!old) return old;

        if (Array.isArray(old)) {
          return old.map((order: OrderItem) => {
            if (order.id === payload.id) {
              return { ...order, status: payload.status };
            } else {
              return order;
            }
          });
        }

        return old;
      });

      return { previousOrders };
    },
    onSuccess: (data) => {
      showSuccessToast(data.message || "Статус заказа изменен");
      queryClient.invalidateQueries({ queryKey: ["seller-orders"] });
    },
    onError: (error: any) => {
      showErrorToast(
        "Ошибка при изменении статуса заказа",
        error?.response?.data?.message,
      );
    },
  });
};
