import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Регистрация продавца | YouMarket",
  description: "Регистрация продавца",
};

export default function SignupSellerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}