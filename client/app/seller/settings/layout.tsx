import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Настройки профиля",
  description: "Настройки профиля",
};

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}