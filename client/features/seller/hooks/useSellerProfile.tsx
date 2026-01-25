import { useQuery } from "@tanstack/react-query";
import { api } from "../../../lib/api";

export interface SellerProfile {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  created_at: string;
  sellers: {
    storeName: string;
    description: string | null;
    phone: string | null;
    category: string;
    approved: boolean;
    avatarUrl: string | null;
  };
}

export const useSellerProfile = () => {
  return useQuery({
    queryKey: ["seller-profile"],
    queryFn: async () => {
      const res = await api.get("/auth/me");
      return res.data as SellerProfile;
    },
  });
};

