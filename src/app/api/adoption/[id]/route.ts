import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await prisma.user.findUnique({ where: { clerkId } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const params = await props.params;
    const postId = params.id;

    const post = await prisma.adoptionPost.findUnique({ where: { id: postId } });
    if (!post) return NextResponse.json({ error: "Post not found" }, { status: 404 });

    if (post.ownerId !== user.id) {
      return NextResponse.json({ error: "Forbidden: Not the owner" }, { status: 403 });
    }

    await prisma.adoptionPost.delete({ where: { id: postId } });
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await prisma.user.findUnique({ where: { clerkId } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const params = await props.params;
    const postId = params.id;

    const post = await prisma.adoptionPost.findUnique({ where: { id: postId } });
    if (!post) return NextResponse.json({ error: "Post not found" }, { status: 404 });

    if (post.ownerId !== user.id) {
      return NextResponse.json({ error: "Forbidden: Not the owner" }, { status: 403 });
    }

    const body = await req.json();
    const allowedFields = ["status", "reason", "description", "type"];
    const updateData: any = {};

    for (const key of allowedFields) {
      if (body[key] !== undefined) {
        updateData[key] = body[key];
      }
    }

    const updated = await prisma.adoptionPost.update({
      where: { id: postId },
      data: updateData,
    });

    return NextResponse.json(updated);
  } catch (err) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
