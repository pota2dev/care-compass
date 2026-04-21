import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import ChatClient from "@/components/chat/ChatClient";

export default async function ChatPage() {
  const clerkUser = await currentUser();
  if (!clerkUser) return null;

  const user = await prisma.user.findUnique({
    where: { clerkId: clerkUser.id },
  });

  const rooms = user
    ? await prisma.chatRoom.findMany({
        where: { userId: user.id },
        include: {
          messages: { orderBy: { createdAt: "desc" }, take: 1 },
          _count: { select: { messages: true } },
        },
        orderBy: { updatedAt: "desc" },
      })
    : [];


  const formattedRooms = rooms.map((room) => ({
    ...room,
    createdAt: room.createdAt.toISOString(),
    updatedAt: room.updatedAt.toISOString(),
    messages: room.messages.map((msg) => ({
      ...msg,
      createdAt: msg.createdAt.toISOString(),
    })),
  }));

  return (
    <ChatClient
      userId={user?.id ?? ""}
      userName={clerkUser.fullName ?? "User"}
      userAvatar={clerkUser.imageUrl}
      initialRooms={formattedRooms} 
    />
  );
}
