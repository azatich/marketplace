import { OrderItem } from "../types";
import { OrderStatusBadge } from "./OrderStatusBadge";
import Link from "next/link";

export const OrderItemRow = ({ item }: { item: OrderItem }) => {
  const product = item.products;
  const imageUrl = product?.images?.[0] || "/placeholder.jpg";

  return (
    <div className="flex flex-col sm:flex-row gap-4 py-4 items-start sm:items-center group">
      <Link href={`/product/${item.product_id}`} className="shrink-0">
        <div className="w-20 h-20 rounded-lg overflow-hidden border border-white/5 group-hover:border-[#8B7FFF]/50 transition-colors">
          <img src={imageUrl} alt={product.title} className="w-full h-full object-cover" />
        </div>
      </Link>
      
      <div className="flex-1 min-w-0">
        <Link href={`/product/${item.product_id}`}>
          <h4 className="font-medium text-white mb-1 truncate group-hover:text-[#8B7FFF] transition-colors">
            {product.title}
          </h4>
        </Link>
        <div className="text-sm text-[#A0AEC0] flex flex-wrap gap-x-4 gap-y-1">
          <span>Цена: ${item.price_at_purchase.toFixed(2)}</span>
          <span>Кол-во: {item.quantity} шт.</span>
        </div>
      </div>

      <div className="flex flex-row sm:flex-col items-center sm:items-end gap-3 sm:gap-2 w-full sm:w-auto mt-2 sm:mt-0 justify-between sm:justify-start">
        <span className="font-bold text-white text-lg">
          ${(item.price_at_purchase * item.quantity).toFixed(2)}
        </span>
        <OrderStatusBadge status={item.status} />
      </div>
    </div>
  );
};