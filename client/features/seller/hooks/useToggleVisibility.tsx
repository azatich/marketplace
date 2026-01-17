import { api } from "@/lib/api";
import { showErrorToast, showSuccessToast } from "@/lib/toasts";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ProductItem } from "../types";

export const useToggleVisibility = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (productId: string) => {
      const res = await api.post(
        `/seller/products/toggle-visibility/${productId}`
      );
      return res.data;
    },

    onMutate: async (productId) => {
      // Отменяем текущие запросы
      await queryClient.cancelQueries({ queryKey: ["seller-products"] });

      // Сохраняем предыдущее состояние
      const previousProducts = queryClient.getQueryData(["seller-products"]);

      // Оптимистично обновляем кэш
      queryClient.setQueryData(["seller-products"], (old: any) => {
        if (!old) return old;

        // Обрабатываем разные возможные структуры данных
        if (Array.isArray(old)) {
          return old.map((product: ProductItem) =>
            product.id === productId
              ? { ...product, visibility: !product.visibility }
              : product
          );
        }

        return old;
      });

      // Возвращаем контекст для возможного отката
      return { previousProducts };
    },

    onSuccess: (data) => {
      showSuccessToast("Видимость продукта изменена", data.message);
      queryClient.invalidateQueries({ queryKey: ["seller-products"] });
    },

    onError: (error: any, productId, context) => {
      if (context?.previousProducts) {
        queryClient.setQueryData(["seller-products"], context.previousProducts);
      }

      showErrorToast(
        "Не удалось изменить видимость продукта",
        error?.response?.data?.message || "Произошла ошибка"
      );
    },
  });
};
