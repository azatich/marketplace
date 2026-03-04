import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Сообщения",
  description: "Общайтесь с клиентами",
};

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}