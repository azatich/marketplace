import { api } from "@/lib/api";
import { showErrorToast, showSuccessToast } from "@/lib/toasts";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface UpdateClientProfileRequest {
    first_name?: string
    last_name?: string
    username?: string
    password?: string
    phone?: string
    avatar?: File
    gender?: "male" | "female" | "other"
    birth_date?: string
    addresses?: {}[]
}

export const useUpdateClientProfile = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: UpdateClientProfileRequest) => {
      const formData = new FormData();

      if (data.first_name) formData.append("first_name", data.first_name);
      if (data.last_name) formData.append("last_name", data.last_name);
      if (data.password) formData.append("password", data.password);
      if (data.phone) formData.append("phone", data.phone);
      if (data.avatar) formData.append("avatar", data.avatar);
      if (data.gender) formData.append("gender", data.gender);
      if (data.birth_date) formData.append("birth_date", data.birth_date);
      if (data.username) formData.append("username", data.username);
      
      // ИСПРАВЛЕНО: Сериализуем массив адресов в JSON-строку
      if (data.addresses) {
        formData.append("addresses", JSON.stringify(data.addresses));
      }

      // ИСПРАВЛЕНО: путь должен быть /client/profile
      const res = await api.put("/client/profile", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data;
    },
    onSuccess: (data) => {
      // ИСПРАВЛЕНО: инвалидируем ключ клиента
      queryClient.invalidateQueries({ queryKey: ["client-profile"] });
      showSuccessToast(data.message || "Профиль успешно обновлен");
    },
    onError: (error: any) => {
      showErrorToast("Ошибка", error?.response?.data?.message || "Не удалось обновить профиль");
    },
  });
};
