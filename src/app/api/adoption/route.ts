import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createPostSchema = z.object({
  petId: z.string(),
  type: z.enum(["PERMANENT", "TEMPORARY_FOSTER"]),
  reason: z.string().min(10),
  description: z.string().optional(),
});

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type");

  const posts = await prisma.adoptionPost.findMany({
    where: {
      status: "OPEN",
      ...(type ? { type: type as any } : {}),
    },
    include: {
      pet: true,
      owner: { select: { name: true, city: true } },
      _count: { select: { requests: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(posts);
}

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const body = await req.json();
  const parsed = createPostSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  // Verify pet belongs to user
  const pet = await prisma.pet.findFirst({ where: { id: parsed.data.petId, ownerId: user.id } });
  if (!pet) return NextResponse.json({ error: "Pet not found or not yours" }, { status: 403 });

  const post = await prisma.adoptionPost.create({
    data: { ...parsed.data, ownerId: user.id },
    include: { pet: true },
  });

  return NextResponse.json(post, { status: 201 });
}
