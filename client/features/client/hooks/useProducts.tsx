import { useQuery } from "@tanstack/react-query";
import { api } from "../../../lib/api";
import { ProductsResponse, ProductFilters } from "../types";

export const useProducts = (filters?: ProductFilters) => {
  return useQuery({
    queryKey: ["products", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      
      if (filters?.search) params.append("search", filters.search);
      if (filters?.category) params.append("category", filters.category);
      if (filters?.subcategory) params.append("subcategory", filters.subcategory);
      if (filters?.minPrice !== undefined) params.append("minPrice", filters.minPrice.toString());
      if (filters?.maxPrice !== undefined) params.append("maxPrice", filters.maxPrice.toString());
      if (filters?.hasDiscount) params.append("hasDiscount", "true");
      if (filters?.sortBy) params.append("sortBy", filters.sortBy);
      if (filters?.sortOrder) params.append("sortOrder", filters.sortOrder);
      if (filters?.page) params.append("page", filters.page.toString());
      if (filters?.limit) params.append("limit", filters.limit.toString());

      const res = await api.get(`/client/products?${params.toString()}`);
      return res.data as ProductsResponse;
    },
  });
};

