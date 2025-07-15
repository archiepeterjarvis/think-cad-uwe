"use client";

import {useChat} from "@ai-sdk/react";
import {UIMessage} from "ai";
import {Session} from "next-auth";
import {createId} from "@paralleldrive/cuid2";
import {useSearchParams} from "next/navigation";
import {useEffect, useState} from "react";
import {Messages} from "@/components/chat/chat-messages";
import {ChatInput} from "@/components/chat/chat-input";
import {ChatHeader} from "@/components/chat/chat-header";
import {GeometricShapes} from "@/components/homepage/geometric-shapes";

export function Chat({
                       id,
                       initialMessages,
                       session,
                     }: {
  id: string;
  initialMessages: Array<UIMessage>;
  session: Session;
}) {

  const {
    messages,
    setMessages,
    handleSubmit,
    input,
    setInput,
    append,
    status,
    stop,
    reload,
    data,
  } = useChat({
    id,
    initialMessages,
    experimental_throttle: 100,
    sendExtraMessageFields: true,
    generateId: createId,
    experimental_prepareRequestBody: (body) => ({
      id,
      message: body.messages.at(-1),
    }),
  });

  const searchParams = useSearchParams();
  const query = searchParams.get("query");

  const [hasAppendedQuery, setHasAppendedQuery] = useState(false);

  useEffect(() => {
    if (query && !hasAppendedQuery) {
      append({
        role: "user",
        content: query,
      });

      setHasAppendedQuery(true);
      window.history.replaceState({}, "", `/chat/${id}`);
    }
  }, [query, append, hasAppendedQuery, id]);

  return (
    <>
      <div className="flex flex-col min-w-0 h-dvh z-10 relative">
        <ChatHeader/>

        <Messages
          chatId={id}
          status={status}
          messages={messages}
          setMessages={setMessages}
          reload={reload}
          append={append}
        />

        <form className="flex mx-auto px-4 pb-4 md:pb-6 gap-2 w-full md:max-w-3xl">
          <ChatInput
            chatId={id}
            input={input}
            setInput={setInput}
            status={status}
            stop={stop}
            messages={messages}
            setMessages={setMessages}
            append={append}
            handleSubmit={handleSubmit}
          />
        </form>
      </div>
      <GeometricShapes/>
    </>
  );
}
