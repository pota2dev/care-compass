import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createEventSchema = z.object({
  title: z.string().min(3),
  description: z.string().optional(),
  category: z.enum(["MEETUP", "ADOPTION_FAIR", "VACCINATION_CAMP", "TRAINING_WORKSHOP", "PET_SHOW", "OTHER"]),
  location: z.string().min(1),
  city: z.string().min(1),
  startDate: z.string(),
  endDate: z.string().optional(),
  maxAttendees: z.number().int().positive().optional(),
  isFree: z.boolean().default(true),
  fee: z.number().optional(),
});

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const city = searchParams.get("city");
  const upcoming = searchParams.get("upcoming") === "true";

  const events = await prisma.event.findMany({
    where: {
      isActive: true,
      ...(upcoming ? { startDate: { gte: new Date() } } : {}),
      ...(category ? { category: category as any } : {}),
      ...(city ? { city: { contains: city, mode: "insensitive" } } : {}),
    },
    include: {
      creator: { select: { name: true, avatarUrl: true } },
      _count: { select: { rsvps: true } },
    },
    orderBy: { startDate: "asc" },
  });

  return NextResponse.json(events);
}

export async function POST(req: NextRequest) {
  let userId: string | null = null;
  if (process.env.NODE_ENV === "development" && req.headers.get("x-test-user-id")) {
    userId = req.headers.get("x-test-user-id");
  } else {
    const authResult = await auth();
    userId = authResult.userId;
  }

  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const body = await req.json();
  const parsed = createEventSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const event = await prisma.event.create({
    data: {
      ...parsed.data,
      creatorId: user.id,
      startDate: new Date(parsed.data.startDate),
      endDate: parsed.data.endDate ? new Date(parsed.data.endDate) : undefined,
    },
    include: { _count: { select: { rsvps: true } } },
  });

  return NextResponse.json(event, { status: 201 });
}
