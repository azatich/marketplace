import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Профиль",
  description: "Ваш профиль и настройки.",
};

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}