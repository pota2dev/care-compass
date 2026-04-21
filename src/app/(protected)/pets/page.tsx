import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Plus } from "lucide-react";

export const metadata = { title: "My Pets" };

const petEmoji: Record<string, string> = { dog: "🐕", cat: "🐈", rabbit: "🐇", bird: "🦜", fish: "🐠" };

export default async function PetsPage() {
  const clerkUser = await currentUser();
  if (!clerkUser) redirect("/sign-in");
  const user = await prisma.user.findUnique({ where: { clerkId: clerkUser.id } });
  if (!user) redirect("/sign-in");

  const pets = await prisma.pet.findMany({
    where: { ownerId: user.id, isActive: true },
    include: { 
      healthRecords: { orderBy: { date: "desc" }, take: 1 },
      adoptionPosts: true, 
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold">My Pets</h1>
          <p className="text-sm text-gray-400 mt-1">Manage your registered pets</p>
        </div>
        <Link href="/pets/new" className="inline-flex items-center gap-2 bg-[#2D5016] text-white px-5 py-2.5 rounded-full text-sm font-medium hover:bg-[#4A7C28] transition-all">
          <Plus className="w-4 h-4" /> Add Pet
        </Link>
      </div>

      {pets.length === 0 ? (
        <div className="bg-white rounded-2xl border border-black/[0.06] p-16 text-center">
          <div className="text-6xl mb-4">🐾</div>
          <h2 className="font-display text-xl font-semibold mb-2">No pets yet</h2>
          <p className="text-gray-400 text-sm mb-6">Add your first pet to get started with bookings and health tracking.</p>
          <Link href="/pets/new" className="inline-flex items-center gap-2 bg-[#2D5016] text-white px-6 py-3 rounded-full font-medium hover:bg-[#4A7C28] transition-all">
            <Plus className="w-4 h-4" /> Add Your First Pet
          </Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {pets.map((pet) => {
            // Check if any adoption post linked to this pet is marked as ADOPTED
            const isAdopted = pet.adoptionPosts.some(post => post.status === "ADOPTED");

            return (
              <Link key={pet.id} href={`/pets/${pet.id}`}
                className="relative bg-white rounded-2xl border border-black/[0.06] p-6 hover:-translate-y-1 hover:shadow-lg hover:shadow-black/5 hover:border-[#C8DFB0] transition-all group">
                
                {/* --- ADOPTED TAG START --- */}
                {isAdopted && (
                  <div className="absolute top-4 right-4 z-10 bg-[#F1F1F1] text-[#71717A] text-[10px] px-2 py-0.5 rounded uppercase font-bold border border-black/5 shadow-sm">
                    Adopted
                  </div>
                )}
                {/* --- ADOPTED TAG END --- */}

                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 rounded-2xl bg-[#FAF7F2] flex items-center justify-center text-4xl">
                    {petEmoji[pet.species.toLowerCase()] ?? "🐾"}
                  </div>
                  <div>
                    <h3 className="font-display text-xl font-semibold">{pet.name}</h3>
                    <p className="text-sm text-gray-400">{pet.breed ?? pet.species}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="bg-[#FAF7F2] rounded-xl p-3">
                    <div className="text-gray-400 mb-0.5">Gender</div>
                    <div className="font-medium text-gray-700">{pet.gender.charAt(0) + pet.gender.slice(1).toLowerCase()}</div>
                  </div>
                  {pet.dateOfBirth && (
                    <div className="bg-[#FAF7F2] rounded-xl p-3">
                      <div className="text-gray-400 mb-0.5">Age</div>
                      <div className="font-medium text-gray-700">
                        {Math.floor((Date.now() - new Date(pet.dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000))} years
                      </div>
                    </div>
                  )}
                  {pet.weight && (
                    <div className="bg-[#FAF7F2] rounded-xl p-3">
                      <div className="text-gray-400 mb-0.5">Weight</div>
                      <div className="font-medium text-gray-700">{pet.weight} kg</div>
                    </div>
                  )}
                  {pet.color && (
                    <div className="bg-[#FAF7F2] rounded-xl p-3">
                      <div className="text-gray-400 mb-0.5">Color</div>
                      <div className="font-medium text-gray-700">{pet.color}</div>
                    </div>
                  )}
                </div>
                {pet.healthRecords[0] && (
                  <div className="mt-4 pt-4 border-t border-black/[0.06]">
                    <p className="text-xs text-gray-400">Last health record: {pet.healthRecords[0].type}</p>
                  </div>
                )}
              </Link>
            );
          })}
          
          <Link href="/pets/new"
            className="bg-white rounded-2xl border border-dashed border-black/15 p-6 flex flex-col items-center justify-center gap-3 hover:border-[#4A7C28] hover:bg-[#FAF7F2] transition-all min-h-[200px]">
            <div className="w-12 h-12 rounded-full bg-[#FAF7F2] flex items-center justify-center">
              <Plus className="w-5 h-5 text-gray-400" />
            </div>
            <div className="text-sm text-gray-400 font-medium">Add New Pet</div>
          </Link>
        </div>
      )}
    </div>
  );
}
