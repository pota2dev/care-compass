"use server";

import { prisma } from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";
import { ExpenseCategory } from "@prisma/client";
import { revalidatePath } from "next/cache";

export async function addPetExpense(data: {
  amount: number;
  category: ExpenseCategory;
  date: Date;
  description?: string;
  petId: string;
}) {
  const user = await currentUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const dbUser = await prisma.user.findUnique({
    where: { clerkId: user.id },
  });

  if (!dbUser) {
    throw new Error("User not found in database");
  }

  // Ensure user owns the pet
  const pet = await prisma.pet.findUnique({
    where: { id: data.petId },
  });

  if (!pet || pet.ownerId !== dbUser.id) {
    throw new Error("You do not own this pet");
  }

  const expense = await prisma.petExpense.create({
    data: {
      ...data,
      userId: dbUser.id,
    },
  });

  revalidatePath("/expenses");
  return expense;
}

export async function getMonthlyExpenses(petId?: string) {
  const user = await currentUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const dbUser = await prisma.user.findUnique({
    where: { clerkId: user.id },
  });

  if (!dbUser) {
    throw new Error("User not found in database");
  }

  // Fetch expenses for the past 12 months
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

  const expenses = await prisma.petExpense.findMany({
    where: {
      userId: dbUser.id,
      ...(petId ? { petId } : {}),
      date: {
        gte: oneYearAgo,
      },
    },
    orderBy: {
      date: "asc",
    },
    include: {
      pet: {
        select: {
          name: true,
        },
      },
    },
  });

  return expenses;
}

export async function deletePetExpense(expenseId: string) {
  const user = await currentUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const dbUser = await prisma.user.findUnique({
    where: { clerkId: user.id },
  });

  if (!dbUser) return;

  const expense = await prisma.petExpense.findUnique({
    where: { id: expenseId },
  });

  if (!expense || expense.userId !== dbUser.id) {
    throw new Error("Expense not found or unauthorized");
  }

  await prisma.petExpense.delete({
    where: { id: expenseId },
  });

  revalidatePath("/expenses");
}

export async function getUserPets() {
  const user = await currentUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const dbUser = await prisma.user.findUnique({
    where: { clerkId: user.id },
    include: {
      pets: true,
    },
  });

  return dbUser?.pets || [];
}
