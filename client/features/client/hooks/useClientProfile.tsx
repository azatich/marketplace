import { api } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

interface Address {
  id: string;
  value: string;
}

interface Customer {
  phone: string | null;
  gender: "male" | "female" | "other" | null;
  addresses: Address[];
  avatar_url: string | null;
  birth_date: string | null;
  username: string | null;
}

interface ClientProfileResponse {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: "client" | "seller" | "admin";
  created_at: string;
  updated_at: string;
  customers: Customer[];
}

export const useClientProfile = () => {
  return useQuery<ClientProfileResponse>({
    queryKey: ["clientProfile"],
    queryFn: async () => {
      const res = await api.get("/auth/me");
      return res.data;
    },
  });
};
