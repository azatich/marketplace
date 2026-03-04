import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Каталог товаров",
  description: "Широкий выбор товаров в нашем каталоге",
};

export default function CatalogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}