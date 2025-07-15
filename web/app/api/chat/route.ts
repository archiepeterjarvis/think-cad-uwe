import { PostRequestBody, postRequestBodySchema } from "@/app/api/chat/schema";
import { ChatSDKError } from "@/lib/errors";
import { auth } from "@/app/(auth)/api/auth/[...nextauth]/route";
import {
  deleteChatById,
  getChatById,
  getMessagesByChatId,
  saveChat,
  saveMessages,
} from "@/lib/db/queries";
import { appendClientMessage, appendResponseMessages, streamText } from "ai";
import { openai } from "@ai-sdk/openai";
import { cadGenerator } from "@/lib/ai/tools/cad-generator";
import { getTrailingMessageId } from "@/lib/utils";
import { systemPrompt } from "@/lib/ai/prompts";
import { generateTitleFromUserMessage } from "@/app/chat/actions";

export const maxDuration = 30;

export async function POST(req: Request) {
  let requestBody: PostRequestBody;

  try {
    const json = await req.json();
    requestBody = postRequestBodySchema.parse(json);
  } catch {
    return new ChatSDKError("bad_request:api").toResponse();
  }

  try {
    const { id, message } = requestBody;

    const session = await auth();

    if (!session?.user || !session?.user.id) {
      return new ChatSDKError("unauthorized:chat").toResponse();
    }

    const chat = await getChatById({ id });

    if (!chat) {
      const title = await generateTitleFromUserMessage({ message });

      await saveChat({ id, userId: session.user.id, title });
    } else {
      if (chat.userId !== session.user.id) {
        return new ChatSDKError("unauthorized:chat").toResponse();
      }
    }

    const previousMessages = await getMessagesByChatId({ chatId: id });

    const messages = appendClientMessage({
      // @ts-expect-error: todo add type conversion from DBMessage[] to UIMessage[]
      messages: previousMessages,
      message,
    });

    await saveMessages({
      messages: [
        {
          chatId: id,
          id: message.id,
          role: "user",
          parts: message.parts,
          createdAt: new Date(),
          content: "",
          updatedAt: new Date(),
        },
      ],
    });

    const result = streamText({
      model: openai("gpt-3.5-turbo"),
      system: systemPrompt,
      messages,
      maxSteps: 2,
      experimental_activeTools: ["cadGenerator"],
      tools: {
        cadGenerator,
      },
      onFinish: async ({ response }) => {
        if (session.user?.id) {
          try {
            const assistantId = getTrailingMessageId({
              messages: response.messages.filter(
                (message) => message.role === "assistant",
              ),
            });

            if (!assistantId) {
              throw new Error("Assistant not found.");
            }

            const [, assistantMessage] = appendResponseMessages({
              messages: [message],
              responseMessages: response.messages,
            });

            await saveMessages({
              messages: [
                {
                  id: assistantId,
                  chatId: id,
                  role: assistantMessage.role,
                  // @ts-expect-error: todo add type conversion from ChatMessage[] to UIMessage[]
                  parts: assistantMessage.parts,
                  createdAt: new Date(),
                },
              ],
            });
          } catch {
            console.error("Failed to catch error");
          }
        }
      },
    });

    return result.toDataStreamResponse();
  } catch (error) {
    if (error instanceof ChatSDKError) {
      return error.toResponse();
    }
  }

  return new ChatSDKError("bad_request:chat").toResponse();
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return new ChatSDKError("bad_request:api").toResponse();
  }

  const session = await auth();

  if (!session?.user) {
    return new ChatSDKError("unauthorized:chat").toResponse();
  }

  const chat = await getChatById({ id });

  if (!chat) {
    return new ChatSDKError("not_found:chat").toResponse();
  }

  if (chat.userId !== session.user.id) {
    return new ChatSDKError("unauthorized:chat").toResponse();
  }

  await deleteChatById({ id });

  return Response.json({ status: 200 });
}
