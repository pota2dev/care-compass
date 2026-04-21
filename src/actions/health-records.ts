"use server";

import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function addHealthRecord(
  petId: string,
  data: {
    type: string;
    title?: string;
    description: string;
    date: Date;
    vetName?: string;
    documentUrl?: string;
    weight?: number;
    allergies?: string;
  }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      throw new Error("Unauthorized");
    }

    const dbUser = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!dbUser) {
      throw new Error("User not found in database");
    }

    const pet = await prisma.pet.findUnique({
      where: { id: petId },
    });

    if (!pet || pet.ownerId !== dbUser.id) {
      throw new Error("Unauthorized access to this pet");
    }

    let nextDueDate: Date | undefined = undefined;

    if (data.type === "VACCINATION") {
      if (pet.dateOfBirth) {
        const ageInWeeks = (data.date.getTime() - pet.dateOfBirth.getTime()) / (1000 * 60 * 60 * 24 * 7);
        if (ageInWeeks < 16) {
          // Puppy/Kitten schedule: repeat every 4 weeks until 16 weeks old
          nextDueDate = new Date(data.date);
          nextDueDate.setDate(nextDueDate.getDate() + 28);
        } else if (ageInWeeks >= 16 && ageInWeeks < 52) {
          // Next booster typically around 1 year of age
          nextDueDate = new Date(pet.dateOfBirth);
          nextDueDate.setFullYear(nextDueDate.getFullYear() + 1);
        } else {
          // Adult schedule: annual booster
          nextDueDate = new Date(data.date);
          nextDueDate.setFullYear(nextDueDate.getFullYear() + 1);
        }
      } else {
        // Fallback if no Date of Birth is recorded
        nextDueDate = new Date(data.date);
        nextDueDate.setFullYear(nextDueDate.getFullYear() + 1);
      }
    }

    const healthRecord = await prisma.healthRecord.create({
      data: {
        petId,
        type: data.type,
        title: data.title,
        description: data.description,
        date: data.date,
        nextDueDate,
        vetName: data.vetName,
        documentUrl: data.documentUrl,
        weight: data.weight,
        allergies: data.allergies,
      },
    });

    // Update Pet's most recent weight and allergies if provided
    if (data.weight || data.allergies) {
      await prisma.pet.update({
        where: { id: petId },
        data: {
          ...(data.weight ? { weight: data.weight } : {}),
          ...(data.allergies ? { allergies: data.allergies } : {}),
        },
      });
    }

    revalidatePath(`/pets/${petId}`);
    return { success: true, healthRecord };
  } catch (error: any) {
    console.error("Failed to add health record:", error);
    return { success: false, error: error.message };
  }
}

export async function getHealthRecords(petId: string) {
  try {
    const { userId } = await auth();
    if (!userId) {
      throw new Error("Unauthorized");
    }

    const dbUser = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!dbUser) {
      throw new Error("User not found in database");
    }

    const pet = await prisma.pet.findUnique({
      where: { id: petId },
    });

    if (!pet || pet.ownerId !== dbUser.id) {
      throw new Error("Unauthorized access to this pet");
    }

    const records = await prisma.healthRecord.findMany({
      where: { petId },
      orderBy: { date: "desc" },
    });

    return { success: true, records };
  } catch (error: any) {
    console.error("Failed to fetch health records:", error);
    return { success: false, error: error.message };
  }
}

export async function deleteHealthRecord(recordId: string, petId: string) {
  try {
    const { userId } = await auth();
    if (!userId) {
      throw new Error("Unauthorized");
    }

    const dbUser = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!dbUser) {
      throw new Error("User not found in database");
    }

    const pet = await prisma.pet.findUnique({
      where: { id: petId },
    });

    if (!pet || pet.ownerId !== dbUser.id) {
      throw new Error("Unauthorized access to this pet");
    }

    await prisma.healthRecord.delete({
      where: { id: recordId },
    });

    revalidatePath(`/pets/${petId}`);
    return { success: true };
  } catch (error: any) {
    console.error("Failed to delete health record:", error);
    return { success: false, error: error.message };
  }
}
