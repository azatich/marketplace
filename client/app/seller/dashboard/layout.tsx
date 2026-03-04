import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Дэшборд",
  description: "Управление заказом",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}