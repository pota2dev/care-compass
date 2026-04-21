import { auth, currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createRoomSchema = z.object({
  type:        z.enum(["ADMIN_SUPPORT", "DAYCARE", "SHOP", "RESCUE"]),
  subject:     z.string().optional(),
  providerName:z.string().optional(),
});

// GET /api/chat — get all chat rooms for current user
export async function GET() {
  const { userId: clerkId } = await auth();
  if (!clerkId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { clerkId } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const rooms = await prisma.chatRoom.findMany({
    where: { userId: user.id },
    include: {
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
      _count: { select: { messages: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json(rooms);
}

// POST /api/chat — create or get existing chat room
export async function POST(req: NextRequest) {
  const [{ userId: clerkId }, clerkUser] = await Promise.all([
    auth(), currentUser(),
  ]);
  if (!clerkId || !clerkUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { clerkId } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const body = await req.json();
  const parsed = createRoomSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  // Check if open room of same type already exists
  const existing = await prisma.chatRoom.findFirst({
    where: { userId: user.id, type: parsed.data.type, isOpen: true },
    include: { messages: { orderBy: { createdAt: "asc" } } },
  });

  if (existing) return NextResponse.json(existing);

  // Create new room with welcome message
  const room = await prisma.chatRoom.create({
    data: {
      type:         parsed.data.type,
      userId:       user.id,
      subject:      parsed.data.subject,
      providerName: parsed.data.providerName,
    },
  });

  // Auto welcome message
  const welcomeMessages: Record<string, string> = {
    ADMIN_SUPPORT: "👋 Hello! Welcome to CareCompass support. How can we help you today?",
    DAYCARE:       "👋 Hi! You're connected with our daycare team. Ask us anything about bookings, availability, or your pet's stay!",
    SHOP:          "👋 Welcome to the CareCompass shop! Ask us about products, orders, or delivery status.",
    RESCUE:        "🚨 You're connected with our rescue coordination team. Please describe the situation and location.",
  };

  // Find or create a system admin user for welcome messages
  let adminUser = await prisma.user.findFirst({ where: { role: "ADMIN" } });
  if (!adminUser) adminUser = user; // fallback to self

  await prisma.chatMessage.create({
    data: {
      roomId:     room.id,
      senderId:   adminUser.id,
      senderName: "CareCompass Support",
      content:    welcomeMessages[parsed.data.type],
    },
  });

  const fullRoom = await prisma.chatRoom.findUnique({
    where: { id: room.id },
    include: { messages: { orderBy: { createdAt: "asc" } } },
  });

  return NextResponse.json(fullRoom, { status: 201 });
}
