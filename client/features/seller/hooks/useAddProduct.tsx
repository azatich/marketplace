import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../../lib/api";
import { AddProductRequest } from "../types";
import { showErrorToast, showSuccessToast } from "@/lib/toasts";

export const useAddProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: AddProductRequest) => {
      const res = await api.post("/seller/products", data);
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["seller-products"] });
      showSuccessToast(data.message || "Продукт успешно добавлен");
    },
    onError: (error: any) => {
      showErrorToast('Ошибка при добавлении продукта', error?.response?.data?.message);
    }
  });
};
