import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Заказы",
  description: "Управление заказами",
};

export default function OrdersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}