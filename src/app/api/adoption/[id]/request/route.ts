import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const requestSchema = z.object({
  message: z.string().optional(),
});

export async function POST(
  req: NextRequest,
  props: { params: Promise<{ id: string }> } // Route Handlers in Next.js 15: params passes as a promise
) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await prisma.user.findUnique({ where: { clerkId } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const params = await props.params;
    const postId = params.id;

    const body = await req.json();
    const parsed = requestSchema.safeParse(body);
    
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const post = await prisma.adoptionPost.findUnique({
      where: { id: postId },
    });

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    if (post.ownerId === user.id) {
      return NextResponse.json({ error: "You cannot request your own post" }, { status: 400 });
    }

    if (post.status !== "OPEN") {
      return NextResponse.json({ error: "This post is no longer accepting requests" }, { status: 400 });
    }

    // Check if a request already exists
    const existingRequest = await prisma.adoptionRequest.findFirst({
      where: { postId, userId: user.id },
    });

    if (existingRequest) {
      return NextResponse.json({ error: "You have already requested this pet" }, { status: 400 });
    }

    const newRequest = await prisma.adoptionRequest.create({
      data: {
        postId,
        userId: user.id,
        message: parsed.data.message || "",
        status: "PENDING",
      },
    });

    // Optionally: Create a notification for the owner here

    return NextResponse.json(newRequest, { status: 201 });
  } catch (err: any) {
    console.error("Error creating adoption request:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
