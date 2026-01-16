import { api } from "@/lib/api";
import { showErrorToast, showSuccessToast } from "@/lib/toasts";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useToggleVisibility = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (productId: string) => {
      const res = await api.post(
        `/seller/products/toggle-visibility/${productId}`
      );
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["seller-products"] });
      showSuccessToast('Видимость продукта изменена' ,data.message);
    },
    onError: (error: any) => {
        showErrorToast('Не удалось изменить видимость продукта', error?.response?.data?.message || 'Произошла ошибка')
    }
  });
};
