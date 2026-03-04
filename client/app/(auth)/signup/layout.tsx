import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Регистрация | YouMarket",
  description: "Регистрация",
};

export default function SignupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}