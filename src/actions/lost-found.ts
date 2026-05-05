"use server";

import { prisma } from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";
import { LostFoundType, LostFoundStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";

export async function createLostFoundPost(data: {
  type: LostFoundType;
  petName?: string;
  species: string;
  description?: string;
  location: string;
  city: string;
  latitude?: number;
  longitude?: number;
  imageUrl?: string;
  dateLostOrFound: Date;
}) {
  const user = await currentUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  // Find user in db
  const dbUser = await prisma.user.findUnique({
    where: { clerkId: user.id },
  });

  if (!dbUser) {
    throw new Error("User not found in database");
  }

  const post = await prisma.lostFoundPet.create({
    data: {
      ...data,
      reporterId: dbUser.id,
      status: "OPEN",
    },
  });

  revalidatePath("/lost-found");
  return post;
}

export async function getLostFoundPosts(filters?: {
  type?: LostFoundType;
  city?: string;
  species?: string;
}) {
  return await prisma.lostFoundPet.findMany({
    where: {
      status: "OPEN",
      type: filters?.type ? filters.type : undefined,
      city: filters?.city ? { contains: filters.city, mode: "insensitive" } : undefined,
      species: filters?.species ? { contains: filters.species, mode: "insensitive" } : undefined,
    },
    include: {
      reporter: {
        select: {
          name: true,
          avatarUrl: true,
          email: true,
          phone: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function resolveLostFoundPost(postId: string) {
  const user = await currentUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const post = await prisma.lostFoundPet.findUnique({
    where: { id: postId },
    include: { reporter: true },
  });

  if (!post) {
    throw new Error("Post not found");
  }

  if (post.reporter.clerkId !== user.id) {
    throw new Error("You are not authorized to resolve this post");
  }

  await prisma.lostFoundPet.update({
    where: { id: postId },
    data: { status: "RESOLVED" },
  });

  revalidatePath("/lost-found");
  revalidatePath(`/lost-found/${postId}`);
}

export async function getLostFoundPostById(postId: string) {
  return await prisma.lostFoundPet.findUnique({
    where: { id: postId },
    include: {
      reporter: {
        select: {
          name: true,
          avatarUrl: true,
          phone: true,
          email: true,
        },
      },
    },
  });
}
