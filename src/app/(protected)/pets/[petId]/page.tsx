import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { HealthRecordForm } from "@/components/health/health-record-form";
import { HealthTimeline } from "@/components/health/health-timeline";
import { MoveLeft, User } from "lucide-react";
import Link from "next/link";
import { Pet } from "@prisma/client";

export default async function PetDetailsPage({ params }: { params: Promise<{ petId: string }> }) {
  const { petId } = await params;
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const dbUser = await prisma.user.findUnique({
    where: { clerkId: userId },
  });

  if (!dbUser) {
    redirect("/sign-in");
  }

  const pet = await prisma.pet.findUnique({
    where: { id: petId },
    include: {
      healthRecords: {
        orderBy: { date: 'desc' }
      }
    }
  });

  if (!pet || pet.ownerId !== dbUser.id) {
    redirect("/pets");
  }

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 space-y-8">
      <div>
        <Link 
          href={`/pets`}
          className="inline-flex items-center text-forest-600 hover:text-forest-800 transition-colors mb-4"
        >
          <MoveLeft className="w-4 h-4 mr-2" />
          Back to Pets
        </Link>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-forest-100 text-forest-600 rounded-full flex items-center justify-center text-2xl font-bold">
            {pet.photoUrl ? (
              <img src={pet.photoUrl} alt={pet.name} className="w-16 h-16 rounded-full object-cover" />
            ) : (
              pet.name.charAt(0)
            )}
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {pet.name}
            </h1>
            <p className="text-gray-500">
              {pet.breed || pet.species} • {pet.gender} 
              {pet.weight ? ` • ${pet.weight}kg` : ""}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b pb-4">
          Digital Health & Vaccination Vault
        </h2>
        <HealthRecordForm pet={pet as Pet} />
        
        <div className="mt-8">
          <HealthTimeline records={pet.healthRecords} petId={pet.id} />
        </div>
      </div>
    </div>
  );
}
