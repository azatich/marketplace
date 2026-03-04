import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Войти | YouMarket",
  description: "Войти",
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}