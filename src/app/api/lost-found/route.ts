import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const lostFoundSchema = z.object({
  type: z.enum(["LOST", "FOUND"]),
  petName: z.string().optional(),
  species: z.string().min(1),
  description: z.string().optional(),
  location: z.string().min(1),
  city: z.string().min(1),
  imageUrl: z.string().url().optional(),
  dateLostOrFound: z.string().optional(),
});

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type");
  const city = searchParams.get("city");
  const status = searchParams.get("status") || "OPEN";

  const posts = await prisma.lostFoundPet.findMany({
    where: {
      status: status as any,
      ...(type ? { type: type as any } : {}),
      ...(city ? { city: { contains: city, mode: "insensitive" } } : {}),
    },
    include: {
      reporter: { select: { name: true, avatarUrl: true, phone: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(posts);
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
  const parsed = lostFoundSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const post = await prisma.lostFoundPet.create({
    data: {
      ...parsed.data,
      reporterId: user.id,
      dateLostOrFound: parsed.data.dateLostOrFound ? new Date(parsed.data.dateLostOrFound) : new Date(),
    },
  });

  return NextResponse.json(post, { status: 201 });
}
