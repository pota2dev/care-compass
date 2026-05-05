import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateLostFoundSchema = z.object({
  type: z.enum(["LOST", "FOUND"]).optional(),
  petName: z.string().optional(),
  species: z.string().min(1).optional(),
  description: z.string().optional(),
  location: z.string().min(1).optional(),
  city: z.string().min(1).optional(),
  imageUrl: z.string().url().optional(),
  status: z.enum(["OPEN", "RESOLVED"]).optional(),
  dateLostOrFound: z.string().optional(),
});

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const post = await prisma.lostFoundPet.findUnique({
    where: { id },
    include: {
      reporter: { select: { name: true, avatarUrl: true, phone: true } },
    },
  });

  if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(post);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
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

  const post = await prisma.lostFoundPet.findUnique({ where: { id } });
  if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (post.reporterId !== user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const parsed = updateLostFoundSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const updated = await prisma.lostFoundPet.update({
    where: { id },
    data: {
      ...parsed.data,
      dateLostOrFound: parsed.data.dateLostOrFound ? new Date(parsed.data.dateLostOrFound) : undefined,
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
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

  const post = await prisma.lostFoundPet.findUnique({ where: { id } });
  if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (post.reporterId !== user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await prisma.lostFoundPet.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
