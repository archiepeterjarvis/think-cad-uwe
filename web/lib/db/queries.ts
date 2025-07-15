import { prisma } from "@/lib/prisma";
import { ChatSDKError } from "@/lib/errors";
import { Chat, ChatMessage } from "@/generated/prisma";

export async function getChatById({ id }: { id: string }) {
  try {
    return await prisma.chat.findUnique({
      where: {
        id: id,
      },
    });
  } catch {
    throw new ChatSDKError("bad_request:database", "Failed to get chat by id");
  }
}

export async function getMessagesByChatId({ chatId }: { chatId: string }) {
  try {
    return await prisma.chatMessage.findMany({
      where: {
        chatId: chatId,
      },
    });
  } catch {
    throw new ChatSDKError("bad_request:database", "Failed to get chat by id");
  }
}

export async function saveChat({
  id,
  userId,
  title,
}: {
  id: string;
  userId: string;
  title: string;
}) {
  try {
    await prisma.chat.create({
      data: {
        id,
        userId,
        title,
      },
    });
  } catch {
    throw new ChatSDKError("bad_request:database", "Failed to create chat");
  }
}

export async function saveMessages({
  messages,
}: {
  messages: Array<ChatMessage>;
}) {
  try {
    await prisma.chatMessage.createMany({
      // @ts-expect-error: add conversion
      data: messages,
    });
  } catch {
    throw new ChatSDKError("bad_request:database", "Failed to save messages");
  }
}

export async function getMessageById({ id }: { id: string }) {
  try {
    return await prisma.chatMessage.findUnique({
      where: {
        id: id,
      },
    });
  } catch (e) {
    console.error("Error fetching message by id:", e);
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to get message by id",
    );
  }
}

export async function deleteMessagesByChatIdAfterTimestamp({
  chatId,
  timestamp,
}: {
  chatId: string;
  timestamp: Date;
}) {
  try {
    await prisma.chatMessage.deleteMany({
      where: {
        chatId: chatId,
        createdAt: {
          gte: timestamp,
        },
      },
    });
  } catch {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to delete messages by chat id after timestamp",
    );
  }
}

export async function getChatsByUserId({
  id,
  limit,
  startingAfter,
  endingBefore,
}: {
  id: string;
  limit: number;
  startingAfter: string | null;
  endingBefore: string | null;
}) {
  try {
    const extendedLimit = limit + 1;

    const executeQuery = async (whereCondition?: any) => {
      return prisma.chat.findMany({
        where: {
          userId: id,
          ...whereCondition,
        },
        orderBy: {
          createdAt: "desc",
        },
        take: extendedLimit,
      });
    };

    let filteredChats: Array<Chat> = [];

    if (startingAfter) {
      const selectedChat = await prisma.chat.findUnique({
        where: { id: startingAfter },
      });

      if (!selectedChat) {
        throw new ChatSDKError(
          "not_found:database",
          `Chat with id ${startingAfter} not found`,
        );
      }

      filteredChats = await executeQuery({
        createdAt: {
          gt: selectedChat.createdAt,
        },
      });
    } else if (endingBefore) {
      const selectedChat = await prisma.chat.findUnique({
        where: { id: endingBefore },
      });

      if (!selectedChat) {
        throw new ChatSDKError(
          "not_found:database",
          `Chat with id ${endingBefore} not found`,
        );
      }

      filteredChats = await executeQuery({
        createdAt: {
          lt: selectedChat.createdAt,
        },
      });
    } else {
      filteredChats = await executeQuery();
    }

    const hasMore = filteredChats.length > limit;

    return {
      chats: hasMore ? filteredChats.slice(0, limit) : filteredChats,
      hasMore,
    };
  } catch {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to get chats by user id",
    );
  }
}

export async function deleteChatById({ id }: { id: string }) {
  try {
    await prisma.chatMessage.deleteMany({
      where: {
        chatId: id,
      },
    });

    await prisma.chat.delete({
      where: {
        id: id,
      },
    });

    return true;
  } catch {
    throw new ChatSDKError("bad_request:database", "Failed to delete chat messages");
  }
}