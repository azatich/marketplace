import { useInfiniteQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

interface Pagination {
  page: number;
  limit: number;
  total: number;
}

interface ProductsResponse {
  products: any[];
  pagination: Pagination;
}

export const useProductsInfinite = (filters: any = {}) => {
  return useInfiniteQuery<ProductsResponse>({
    queryKey: ["products", "infinite", filters], 
    
    queryFn: async ({ pageParam = 1 }) => {
      const params = new URLSearchParams({
        page: String(pageParam),
        limit: "12",
        ...filters,
      });

      const res = await api.get(`/client/products?${params.toString()}`);
      return res.data;
    },
    
    initialPageParam: 1,
    
    getNextPageParam: (lastPage) => {
      const { page, limit, total } = lastPage.pagination;
      const loadedItems = page * limit; // Сколько товаров мы уже загрузили теоретически
      
      // Если загруженных товаров меньше, чем всего в базе, значит есть еще страницы
      if (loadedItems < total) {
        return page + 1; // Запрашиваем следующую
      }
      
      return undefined; // Товары закончились, останавливаем скролл
    },
    
    staleTime: 1000 * 60 * 5,
  });
};