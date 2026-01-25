import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../../lib/api";
import { showErrorToast, showSuccessToast } from "@/lib/toasts";

export interface UpdateSellerProfileRequest {
  firstName?: string;
  lastName?: string;
  phone?: string;
  description?: string;
  password?: string;
  avatarUrl?: string;
}

export const useUpdateSellerProfile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: UpdateSellerProfileRequest) => {
      const res = await api.put("/seller/profile", data);
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["seller-profile"] });
      showSuccessToast(data.message || "Профиль успешно обновлен");
    },
    onError: (error: any) => {
      showErrorToast(
        "Ошибка при обновлении профиля",
        error?.response?.data?.message
      );
    },
  });
};

