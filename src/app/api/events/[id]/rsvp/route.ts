import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST /api/events/[id]/rsvp  — join event
// DELETE /api/events/[id]/rsvp — leave event
export async function POST(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const event = await prisma.event.findUnique({ where: { id: params.id }, include: { _count: { select: { rsvps: true } } } });
  if (!event) return NextResponse.json({ error: "Event not found" }, { status: 404 });

  if (event.maxAttendees && event._count.rsvps >= event.maxAttendees) {
    return NextResponse.json({ error: "Event is full" }, { status: 409 });
  }

  const rsvp = await prisma.eventRsvp.upsert({
    where: { eventId_userId: { eventId: params.id, userId: user.id } },
    update: {},
    create: { eventId: params.id, userId: user.id },
  });

  return NextResponse.json(rsvp, { status: 201 });
}

export async function DELETE(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  await prisma.eventRsvp.deleteMany({ where: { eventId: params.id, userId: user.id } });
  return NextResponse.json({ success: true });
}
