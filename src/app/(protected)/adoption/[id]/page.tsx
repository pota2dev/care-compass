import { currentUser } from "@clerk/nextjs/server";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import AdoptionRequestForm from "@/components/adoption/AdoptionRequestForm";
import AdoptionOwnerControls from "@/components/adoption/AdoptionOwnerControls";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

const petEmoji: Record<string, string> = { dog: "🐕", cat: "🐈", rabbit: "🐇", bird: "🦜", fish: "🐠" };

export default async function AdoptionDetailsPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const clerkUser = await currentUser();
  if (!clerkUser) redirect("/sign-in");
  const user = await prisma.user.findUnique({ where: { clerkId: clerkUser.id } });
  if (!user) redirect("/sign-in");

  const post = await prisma.adoptionPost.findUnique({
    where: { id },
    include: {
      pet: true,
      owner: true,
      requests: true,
    },
  });

  if (!post) {
    return notFound();
  }

  const isOwner = post.ownerId === user.id;
  const existingRequest = post.requests.find(r => r.userId === user.id);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Link href="/adoption" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-black">
        <ArrowLeft className="w-4 h-4" /> Back to Adoption Board
      </Link>

      <div className="bg-white rounded-3xl border border-black/[0.08] overflow-hidden shadow-sm">
        <div className="h-48 bg-[#FAF7F2] flex items-center justify-center text-8xl border-b border-black/[0.06]">
          {petEmoji[post.pet.species.toLowerCase()] ?? "🐾"}
        </div>
        
        <div className="p-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="font-display text-4xl font-bold mb-2">{post.pet.name}</h1>
              <p className="text-gray-500 text-lg">{post.pet.breed ?? post.pet.species} · {post.pet.gender.charAt(0) + post.pet.gender.slice(1).toLowerCase()}</p>
            </div>
            <span className={`px-4 py-2 rounded-full font-medium ${post.type === "PERMANENT" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"}`}>
              {post.type === "PERMANENT" ? "Permanent Adoption" : "Temporary Foster"}
            </span>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-2">Pet Details</h3>
                <ul className="space-y-3 text-gray-700 bg-gray-50 rounded-2xl p-5 border border-black/[0.04]">
                  <li><strong className="text-black">Species:</strong> {post.pet.species}</li>
                  {post.pet.breed && <li><strong className="text-black">Breed:</strong> {post.pet.breed}</li>}
                  <li><strong className="text-black">Gender:</strong> {post.pet.gender}</li>
                  {post.pet.weight && <li><strong className="text-black">Weight:</strong> {post.pet.weight} kg</li>}
                  {post.pet.color && <li><strong className="text-black">Color:</strong> {post.pet.color}</li>}
                  {post.pet.notes && <li><strong className="text-black">Notes:</strong> {post.pet.notes}</li>}
                </ul>
              </div>

              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-2">Reason for Posting</h3>
                <p className="text-gray-700 leading-relaxed bg-[#FAF7F2] p-5 rounded-2xl border border-black/[0.04]">{post.reason}</p>
              </div>

              {post.description && (
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-2">Additional Description</h3>
                  <p className="text-gray-700 leading-relaxed">{post.description}</p>
                </div>
              )}
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-2">Current Owner</h3>
                <div className="flex items-center gap-4 bg-gray-50 rounded-2xl p-5 border border-black/[0.04]">
                  <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                    {post.owner.avatarUrl ? (
                      <img src={post.owner.avatarUrl} alt={post.owner.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-xl font-bold text-gray-500">{post.owner.name.charAt(0)}</span>
                    )}
                  </div>
                  <div>
                    <h4 className="font-semibold text-black">{post.owner.name}</h4>
                    <p className="text-sm text-gray-500">📍 {post.owner.city ?? "Location not provided"}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white border rounded-2xl p-6 shadow-sm">
                <h3 className="text-xl font-display font-bold mb-4">Adoption Status</h3>
                
                <div className="flex items-center gap-2 mb-6">
                  <span className={`w-3 h-3 rounded-full ${post.status === "OPEN" ? "bg-green-500" : post.status === "PENDING" ? "bg-yellow-500" : "bg-gray-400"}`}></span>
                  <span className="font-medium text-gray-700">{post.status}</span>
                </div>

                {isOwner ? (
                  <div className="bg-blue-50 text-blue-800 p-4 rounded-xl border border-blue-100">
                    <p className="font-medium">You posted this pet.</p>
                    <p className="text-sm mt-1 mb-2">You have {post.requests.length} pending request(s).</p>
                    <AdoptionOwnerControls postId={post.id} currentStatus={post.status} />
                  </div>
                ) : post.status !== "OPEN" ? (
                  <div className="bg-gray-100 text-gray-600 p-4 rounded-xl text-center">
                    This pet is currently not open for new requests.
                  </div>
                ) : existingRequest ? (
                  <div className="bg-green-50 text-green-800 p-4 rounded-xl border border-green-200">
                    <div className="font-semibold mb-1">Request Sent!</div>
                    <p className="text-sm">You have already requested to adopt {post.pet.name}. The owner will review your request.</p>
                    <div className="mt-2 text-xs font-medium uppercase tracking-wide bg-green-200 text-green-900 inline-block px-2 py-1 rounded">
                      Status: {existingRequest.status}
                    </div>
                  </div>
                ) : (
                  <AdoptionRequestForm postId={post.id} />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
