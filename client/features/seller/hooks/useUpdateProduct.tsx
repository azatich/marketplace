import {
  useMutation,
  UseMutationOptions,
  useQueryClient,
} from "@tanstack/react-query";
import { api } from "@/lib/api";
import { showErrorToast, showSuccessToast } from "@/lib/toasts";
import { ProductItem, UpdatedProductItem } from "../types";

export const useUpdateProduct = (
  options?: UseMutationOptions<any, any, UpdatedProductItem>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdatedProductItem) => {
      const { id, ...productData } = data;
      
      const res = await api.put(`/seller/products/${id}`, productData);
      return res.data;
    },
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: ["seller-products"] });
      queryClient.invalidateQueries({ queryKey: ["product", variables.id] });

      // Вызываем пользовательский onSuccess если есть
      if (options?.onSuccess) {
        options.onSuccess(data, variables, undefined, context);
      }
    },
    onError: (error: any, variables, context) => {
      // Показываем toast с ошибкой
      showErrorToast(
        "Ошибка обновления",
        error.response?.data?.message || "Не удалось обновить продукт"
      );

      // Вызываем пользовательский onError если есть
      if (options?.onError) {
        options.onError(error, variables, undefined, context);
      }
    },
    ...options,
  });
};
