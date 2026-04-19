import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import NewAdoptionForm from "@/components/adoption/NewAdoptionForm";

export const metadata = { title: "Post for Adoption" };

export default async function NewAdoptionPage() {
  const clerkUser = await currentUser();
  if (!clerkUser) redirect("/sign-in");
  const user = await prisma.user.findUnique({ where: { clerkId: clerkUser.id } });
  if (!user) redirect("/sign-in");

  const pets = await prisma.pet.findMany({ where: { ownerId: user.id, isActive: true } });

  return <NewAdoptionForm pets={pets} />;
}
