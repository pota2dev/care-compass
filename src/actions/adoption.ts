"use server";

import { PrismaClient, AdoptionRequestStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";

const prisma = (globalThis as any).prisma || new PrismaClient();
if (process.env.NODE_ENV !== "production") (globalThis as any).prisma = prisma;

export async function acceptAdoptionRequest(requestId: string, petId: string, applicantId: string) {
  console.log("Starting adoption transfer and post cleanup...");
  try {
    const request = await prisma.adoptionRequest.findUnique({
      where: { id: requestId },
      select: { postId: true }
    });

    if (!request) throw new Error("Adoption request not found.");

    await prisma.$transaction([
      prisma.pet.update({
        where: { id: petId },
        data: { ownerId: applicantId },
      }),

      prisma.adoptionPost.deleteMany({
        where: { petId: petId },
      }),
    ]);

    revalidatePath("/adoption");
    return { success: true };
  } catch (error: any) {
    console.error("DATABASE ERROR:", error);
    return { success: false, error: error.message };
  }
}

export async function rejectAdoptionRequest(requestId: string) {
  try {
    await prisma.adoptionRequest.update({
      where: { id: requestId },
      data: { status: AdoptionRequestStatus.REJECTED },
    });
    revalidatePath("/adoption");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}