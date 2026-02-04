"use client";

import { Spinner } from "@/components/ui/spinner";
import { useProductsQuery } from "../hooks/useProductsQuery";
import { ProductItem } from "./ProductItem";

export const ProductsList = () => {
  const { data: products, isPending } = useProductsQuery();

  if (isPending) {
    return (
      <div className="fixed inset-0 flex justify-center items-center z-50">
        <Spinner className="size-16" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {products?.map((product) => (
        <ProductItem key={product.id} product={product} />
      ))}
    </div>
  );
};
