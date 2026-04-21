import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import PetCareClient from "@/components/pet-care/PetCareClient";

export default async function PetCarePage() {
  const clerkUser = await currentUser();
  const user = clerkUser
    ? await prisma.user.findUnique({
        where: { clerkId: clerkUser.id },
        include: {
          pets: {
            where: { isActive: true },
            select: {
              id: true,
              name: true,
              species: true,
              breed: true,
              gender: true,
              dateOfBirth: true,
              weight: true,
            },
          },
        },
      })
    : null;

  return <PetCareClient pets={user?.pets ?? []} />;
}
