import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../../lib/api";
import { showErrorToast, showSuccessToast } from "@/lib/toasts";

export interface UpdateSellerProfileRequest {
  firstName?: string;
  lastName?: string;
  phone?: string;
  description?: string;
  password?: string;
  avatar?: File;
}

export const useUpdateSellerProfile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: UpdateSellerProfileRequest) => {
      const formData = new FormData();
      
      if (data.firstName) formData.append("firstName", data.firstName);
      if (data.lastName) formData.append("lastName", data.lastName);
      if (data.phone !== undefined) formData.append("phone", data.phone);
      if (data.description !== undefined) formData.append("description", data.description);
      if (data.password) formData.append("password", data.password);
      if (data.avatar) formData.append("avatar", data.avatar);

      const res = await api.put("/seller/profile", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
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

