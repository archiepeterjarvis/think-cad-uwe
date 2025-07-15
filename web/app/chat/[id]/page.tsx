import { notFound } from "next/navigation";

import { Chat } from "@/components/chat/chat-interface";
import { getChatById, getMessagesByChatId } from "@/lib/db/queries";
import type { UIMessage } from "ai";
import { auth } from "@/app/(auth)/api/auth/[...nextauth]/route";
import { ChatMessage } from "@/generated/prisma";
import { Session } from "next-auth";

export default async function Page(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const { id } = params;
  const chat = await getChatById({ id });

  if (!chat) {
    notFound();
  }

  const session = await auth();

  const messagesFromDb = await getMessagesByChatId({
    chatId: id,
  });

  function convertToUIMessages(messages: Array<ChatMessage>): Array<UIMessage> {
    return messages.map((message) => ({
      id: message.id,
      parts: message.parts as UIMessage["parts"],
      role: message.role as UIMessage["role"],
      content: "",
      createdAt: message.createdAt,
    }));
  }

  return (
    <>
      <Chat
        id={chat.id}
        initialMessages={convertToUIMessages(messagesFromDb)}
        session={session as Session} // remove
      />
    </>
  );
}
