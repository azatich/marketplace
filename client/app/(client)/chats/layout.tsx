import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Сообщения",
  description: "Ваши переписки с продавцами и покупателями.",
};

export default function ChatsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}