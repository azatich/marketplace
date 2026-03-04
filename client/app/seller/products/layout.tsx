import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Товары",
  description: "Управление товарами",
};

export default function ProductsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}