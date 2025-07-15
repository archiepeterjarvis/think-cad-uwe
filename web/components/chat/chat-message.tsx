"use client";

import {UIMessage} from "ai";
import {UseChatHelpers} from "@ai-sdk/react";
import {memo, useState} from "react";
import {AnimatePresence, motion} from "framer-motion";
import {cn, sanitizeText} from "@/lib/utils";
import {PencilIcon, SparklesIcon} from "lucide-react";
import {Tooltip, TooltipContent, TooltipTrigger,} from "@/components/ui/tooltip";
import {Button} from "@/components/ui/button";
import equal from "fast-deep-equal";
import {cx} from "class-variance-authority";
import {Markdown} from "./markdown";
import {ModelViewer} from "@/components/chat/model-viewer";
import {ModelPreview} from "@/components/chat/model-preview";
import {MessageEditor} from "@/components/chat/chat-message-editor";

function PurePreviewMessage({
                              chatId,
                              message,
                              isLoading,
                              setMessages,
                              reload,
                              requiresScrollPadding,
                              append
                            }: {
  chatId: string;
  message: UIMessage;
  isLoading: boolean;
  setMessages: UseChatHelpers["setMessages"];
  reload: UseChatHelpers["reload"];
  requiresScrollPadding: boolean;
  append: UseChatHelpers["append"];
}) {
  const [mode, setMode] = useState<"view" | "edit">("view");

  return (
    <AnimatePresence>
      <motion.div
        data-testid={`message-${message.role}`}
        className="w-full mx-auto max-w-3xl p-4 group/message"
        initial={{y: 5, opacity: 0}}
        animate={{y: 0, opacity: 1}}
        data-role={message.role}
      >
        <div
          className={cn(
            "flex gap-4 w-full group-data-[role=user]/message:ml-auto group-data-[role=user]/message:max-w-2xl",
            {
              "w-full": mode === "edit",
              "group-data-[role=user]/message:w-fit": mode !== "edit",
            },
          )}
        >
          {message.role === "assistant" && (
            <div
              className="size-8 flex items-center rounded-full justify-center ring-1 shrink-0 ring-border bg-background">
              <div className="translate-y-px">
                <SparklesIcon size={14}/>
              </div>
            </div>
          )}

          <div
            className={cn("flex flex-col gap-4 w-full", {
              "min-h-96": message.role === "assistant" && requiresScrollPadding,
            })}
          >
            {message.parts?.map((part, index) => {
              const {type} = part;
              const key = `message-${message.id}-part-${index}`;

              if (type === "text") {
                if (mode === "view") {
                  return (
                    <div key={key} className="flex flex-row gap-2 items-start">
                      {message.role === "user" && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              data-testid="message-edit-button"
                              variant="ghost"
                              className="px-2 h-fit rounded-full text-muted-foreground opacity-0 group-hover/message:opacity-100"
                              onClick={() => {
                                setMode("edit");
                              }}
                            >
                              <PencilIcon/>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Edit message</TooltipContent>
                        </Tooltip>
                      )}

                      <div
                        data-testid="message-content"
                        className={cn("flex flex-col gap-4", {
                          "bg-gradient-to-r from-primary to-purple text-primary-foreground px-3 py-2 rounded-xl":
                            message.role === "user",
                        })}
                      >
                        <Markdown>{sanitizeText(part.text)}</Markdown>
                      </div>
                    </div>
                  );
                }

                if (mode === "edit") {
                  return (
                    <div key={key} className="flex flex-row gap-2 items-start">
                      <div className="size-8"/>

                      <MessageEditor
                        key={message.id}
                        message={message}
                        setMode={setMode}
                        setMessages={setMessages}
                        reload={reload}
                      />
                    </div>
                  );
                }
              }

              if (type === "tool-invocation") {
                const {toolInvocation} = part;
                const {toolName, toolCallId, state} = toolInvocation;

                if (state === "call") {
                  const {args} = toolInvocation;

                  return (
                    <div key={toolCallId}>
                      {toolName === "cadGenerator" && (
                        <ModelPreview args={args}/>
                      )}
                    </div>
                  );
                }

                if (state === "result") {
                  const {result} = toolInvocation;

                  if (toolName === "cadGenerator") {
                    if (result?.model && typeof result.model === "string") {
                      return (
                        <div key={toolCallId}>
                          <ModelViewer url={result.model}/>
                        </div>
                      )
                    } else if (result?.error) {
                      append({
                        "role": "system",
                        content: "There was an error generating the model: " + result.error,
                      })
                    }
                  }
                }
              }
            })}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

export const PreviewMessage = memo(
  PurePreviewMessage,
  (prevProps, nextProps) => {
    if (prevProps.isLoading !== nextProps.isLoading) return false;
    if (prevProps.message.id !== nextProps.message.id) return false;
    if (prevProps.requiresScrollPadding !== nextProps.requiresScrollPadding)
      return false;
    if (!equal(prevProps.message.parts, nextProps.message.parts)) return false;

    return true;
  },
);

export const ThinkingMessage = () => {
  const role = "assistant";

  return (
    <motion.div
      data-testid="message-assistant-loading"
      className="w-full mx-auto max-w-3xl px-4 group/message min-h-96"
      initial={{y: 5, opacity: 0}}
      animate={{y: 0, opacity: 1, transition: {delay: 1}}}
      data-role={role}
    >
      <div
        className={cx(
          "flex gap-4 group-data-[role=user]/message:px-3 w-full group-data-[role=user]/message:w-fit group-data-[role=user]/message:ml-auto group-data-[role=user]/message:max-w-2xl group-data-[role=user]/message:py-2 rounded-xl",
          {
            "group-data-[role=user]/message:bg-muted": true,
          },
        )}
      >
        <div className="size-8 flex items-center rounded-full justify-center ring-1 shrink-0 ring-border">
          <SparklesIcon size={14}/>
        </div>

        <div className="flex flex-col gap-2 w-full">
          <div className="flex flex-col gap-4 text-muted-foreground">
            Hmm...
          </div>
        </div>
      </div>
    </motion.div>
  );
};
