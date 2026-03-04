import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Корзина товаров",
  description: "Проверьте выбранные товары и перейдите к оформлению заказа.",
};

export default function CartLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}