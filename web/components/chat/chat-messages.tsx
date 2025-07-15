import {useChat, UseChatHelpers} from "@ai-sdk/react";
import { useMessages } from "@/hooks/use-messages";
import equal from "fast-deep-equal";
import { memo } from "react";
import { UIMessage } from "ai";
import {
  PreviewMessage,
  ThinkingMessage,
} from "@/components/chat/chat-message";
import { motion } from "framer-motion";
import { ExamplePrompts } from "@/components/chat/chat-example-prompts";

interface MessagesProps {
  chatId: string;
  status: UseChatHelpers["status"];
  messages: Array<UIMessage>;
  setMessages: UseChatHelpers["setMessages"];
  reload: UseChatHelpers["reload"];
  append: UseChatHelpers["append"];
}

function PureMessages({
  chatId,
  status,
  messages,
  setMessages,
  reload,
  append,
}: MessagesProps) {
  const {
    containerRef: messagesContainerRef,
    endRef: messagesEndRef,
    onViewportEnter,
    onViewportLeave,
    hasSentMessage,
  } = useMessages({
    chatId,
    status,
  });

  return (
    <div
      ref={messagesContainerRef}
      className="flex flex-col min-w-0 gap-6 flex-1 overflow-y-scroll pt-4 relative"
    >
      {messages.length === 0 && (
        <div className="m-auto">
          <ExamplePrompts append={append} chatId={chatId} />
        </div>
      )}

      {messages.map((message, index) => (
        <PreviewMessage
          key={message.id}
          chatId={chatId}
          message={message}
          isLoading={status === "streaming" && messages.length - 1 === index}
          setMessages={setMessages}
          reload={reload}
          requiresScrollPadding={
            hasSentMessage && index === messages.length - 1
          }
          append={append}
        />
      ))}

      {status === "submitted" &&
        messages.length > 0 &&
        messages[messages.length - 1].role === "user" && <ThinkingMessage />}

      <motion.div
        ref={messagesEndRef}
        className="shrink-0 min-w-[24px] min-h-[24px]"
        onViewportLeave={onViewportLeave}
        onViewportEnter={onViewportEnter}
      />
    </div>
  );
}

export const Messages = memo(PureMessages, (prevProps, nextProps) => {
  if (prevProps.status !== nextProps.status) return false;
  if (prevProps.status && nextProps.status) return false;
  if (prevProps.messages.length !== nextProps.messages.length) return false;
  if (!equal(prevProps.messages, nextProps.messages)) return false;

  return true;
});
