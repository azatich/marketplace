import { api } from "@/lib/api";
import { showErrorToast, showSuccessToast } from "@/lib/toasts";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import React from "react";

export const useDeleteMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (productId: string) => {
      const res = await api.delete(`/seller/products/${productId}`);
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["seller-products"] });
      showSuccessToast(data.message);
    },
    onError: (error: any) => {
      showErrorToast(
        "Не удалось удалить продукт",
        error?.response?.data?.message || "Произошла ошибка"
      );
    },
  });
};
