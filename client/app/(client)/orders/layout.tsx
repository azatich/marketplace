import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Мои заказы",
  description: "История ваших покупок и отслеживание статуса текущих заказов.",
};

export default function OrdersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}