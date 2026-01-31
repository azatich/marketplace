import { ProductCategories } from "@/features/seller";

export interface Product {
  id: string;
  seller_id: string;
  title: string;
  description: string;
  category: string;
  subcategory: string;
  quantity: number;
  price: number;
  discount_price: number | null;
  images: string[];
  visibility: boolean;
  created_at: string;
  updated_at: string;
  sellers?: {
    id: string;
    storeName: string;
    description: string | null;
    avatarUrl: string | null;
    phone: string | null;
    user_id: string;
    users?: {
      first_name: string;
      last_name: string;
      email: string;
    };
  };
}

export interface ProductsResponse {
  products: Product[];
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}

export interface CartItem {
  productId: string;
  quantity: number;
  product: Product;
}

export interface ProductFilters {
  search?: string;
  category?: string;
  subcategory?: string;
  minPrice?: number;
  maxPrice?: number;
  hasDiscount?: boolean;
  sortBy?: "price" | "created_at" | "discount";
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
}

export { ProductCategories };

