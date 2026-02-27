import {
  useMutation,
  UseMutationOptions,
  useQueryClient,
} from "@tanstack/react-query";
import { api } from "@/lib/api";
import { showErrorToast } from "@/lib/toasts";
import { UpdatedProductItem } from "../types";

export const useUpdateProduct = (
  options?: UseMutationOptions<any, any, UpdatedProductItem>,
) => {
  const queryClient = useQueryClient();

  const { onSuccess, onError, ...restOptions } = options ?? {};

  return useMutation({
    ...restOptions,
    mutationFn: async (data: UpdatedProductItem) => {
      const { id, ...productData } = data;
      const res = await api.put(`/seller/products/${id}`, productData);
      return res.data;
    },
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: ["seller-products"] });
      queryClient.invalidateQueries({ queryKey: ["product", variables.id] });

      if (onSuccess) {
        onSuccess(data, variables, undefined, context as any);
      }
    },
    onError: (error: any, variables, context) => {
      showErrorToast(
        "Ошибка обновления",
        error.response?.data?.message || "Не удалось обновить продукт",
      );

      if (onError) {
        onError(error, variables, undefined, context as any);
      }
    },
  });
};
