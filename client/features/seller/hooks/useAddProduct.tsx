import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../../lib/api";
import { AddProductRequest } from "../types";
import { showErrorToast, showSuccessToast } from "@/lib/toasts";

export const useAddProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: AddProductRequest) => {
      const formData = new FormData();
      formData.append("title", data.title);
      formData.append("category", data.category);
      formData.append("subcategory", data.subcategory);
      formData.append("quantity", data.quantity.toString());
      formData.append("price", data.price.toString());
      if (data.description) {
        formData.append("description", data.description);
      }
      if (data.discountedPrice) {
        formData.append("discountedPrice", data.discountedPrice.toString());
      }
      if (data.visibility !== undefined) {
        formData.append("visibility", data.visibility.toString());
      }
      // Добавляем файлы изображений
      data.images.forEach((file) => {
        formData.append("images", file);
      });

      const res = await api.post("/seller/products", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
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
