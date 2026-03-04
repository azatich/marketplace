export interface AddProductRequest {
  title: string;
  description?: string;
  category: string;
  subcategory: string;
  quantity: number;
  price: number;
  discountedPrice?: number;
  images: File[];
  visibility?: boolean;
}

export interface ProductItem {
  id: string;
  seller_id: string;
  title: string;
  description?: string;
  category: string;
  subcategory: string;
  quantity: number;
  price: number;
  discount_price: number | null;
  images: string[]
  visibility: boolean;
  created_at: string;
  updated_at: string;
}

export interface UpdatedProductItem {
  id: string;
  title: string;
  description: string;
  category: string;
  subcategory: string;
  quantity: number;
  price: number;
  discount_price: number | null;
  images: string[]
  visibility: boolean;
}

export type OrderItemStatus = 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'cancellation_requested';;

export interface SellerOrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  price_at_purchase: number;
  status: OrderItemStatus;
  created_at: string;
  
  products: {
    title: string;
    images: string[];
  };
  
  orders: {
    shipping_address: { value: string };
    status: string; // Глобальный статус оплаты чека
    created_at: string;
    users: {
      id: string;
      first_name: string | null;
      last_name: string | null;
      email: string;
      customers: {
        phone: string | null;
      }[];
    };
  };

  cancellation_requests?: { 
    reason: string; 
    status: string; 
    initiated_by: string; 
  }[];
}

