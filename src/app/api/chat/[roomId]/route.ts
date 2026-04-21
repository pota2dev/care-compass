import { auth, currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/chat/[roomId] — get messages for a room
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) {
  const { roomId } = await params;
  const { userId: clerkId } = await auth();
  if (!clerkId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { clerkId } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const room = await prisma.chatRoom.findFirst({
    where: { id: roomId, userId: user.id },
    include: {
      messages: {
        orderBy: { createdAt: "asc" },
        include: { sender: { select: { name: true, avatarUrl: true } } },
      },
    },
  });

  if (!room) return NextResponse.json({ error: "Room not found" }, { status: 404 });

  // Mark messages as read
  await prisma.chatMessage.updateMany({
    where: { roomId, senderId: { not: user.id }, isRead: false },
    data:  { isRead: true },
  });

  return NextResponse.json(room);
}

// POST /api/chat/[roomId] — send a message
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) {
  const { roomId } = await params;
  const [{ userId: clerkId }, clerkUser] = await Promise.all([
    auth(), currentUser(),
  ]);
  if (!clerkId || !clerkUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { clerkId } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const room = await prisma.chatRoom.findFirst({
    where: { id: roomId, userId: user.id },
  });
  if (!room) return NextResponse.json({ error: "Room not found" }, { status: 404 });

  const body = await req.json();
  if (!body.content?.trim()) {
    return NextResponse.json({ error: "Message content required" }, { status: 400 });
  }

  const message = await prisma.chatMessage.create({
    data: {
      roomId,
      senderId:   user.id,
      senderName: clerkUser.fullName ?? user.name,
      content:    body.content.trim(),
    },
    include: { sender: { select: { name: true, avatarUrl: true } } },
  });

  // Update room timestamp
  await prisma.chatRoom.update({
    where: { id: roomId },
    data:  { updatedAt: new Date() },
  });

  // Simulate auto-reply for demo (in production, admins/providers would reply via dashboard)
  const autoReplies: Record<string, string[]> = {
    ADMIN_SUPPORT: [
      "Thank you for reaching out! Our team will get back to you shortly.",
      "We've received your message and will respond within 24 hours.",
      "Thanks for contacting CareCompass support! Is there anything else we can help with?",
    ],
    DAYCARE: [
      "Thanks for your message! Our daycare team will confirm your query soon.",
      "We'll check availability and get back to you shortly!",
    ],
    SHOP: [
      "Thanks for your inquiry! We'll check on that product/order for you.",
      "Our shop team is looking into this — we'll update you soon!",
    ],
    RESCUE: [
      "🚨 Message received. Our rescue team is being notified immediately.",
      "Please stay on the line. A rescue coordinator will respond shortly.",
    ],
  };

  const replies = autoReplies[room.type] ?? ["Message received. We'll respond soon."];
  const autoReply = replies[Math.floor(Math.random() * replies.length)];

  setTimeout(async () => {
    try {
      await prisma.chatMessage.create({
        data: {
          roomId,
          senderId:   user.id, // In production use actual admin/provider user
          senderName: "CareCompass Support",
          content:    autoReply,
        },
      });
      await prisma.chatRoom.update({
        where: { id: roomId },
        data:  { updatedAt: new Date() },
      });
    } catch {}
  }, 2000 + Math.random() * 3000);

  return NextResponse.json(message, { status: 201 });
}
