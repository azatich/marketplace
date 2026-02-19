import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";
import { showErrorToast } from "@/lib/toasts";

export const useStartChat = () => {
  const router = useRouter();

  return useMutation({
    mutationFn: async (sellerId: string) => {

      const res = await api.post("/chats/get-or-create", { sellerId });
      return res.data;
    },
    onSuccess: (data) => {
      router.push(`/profile/chats/${data.chatId}`);
    },
    onError: () => {
      showErrorToast("Ошибка", "Не удалось открыть чат с продавцом");
    },
  });
};