import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Plus } from "lucide-react";
import { formatDate } from "@/lib/utils";

export const metadata = { title: "Pet Adoption" };
const petEmoji: Record<string, string> = { dog: "🐕", cat: "🐈", rabbit: "🐇", bird: "🦜", fish: "🐠" };

export default async function AdoptionPage() {
  const clerkUser = await currentUser();
  if (!clerkUser) redirect("/sign-in");
  const user = await prisma.user.findUnique({ where: { clerkId: clerkUser.id } });
  if (!user) redirect("/sign-in");

  const myPosts = await prisma.adoptionPost.findMany({
    where: { ownerId: user.id },
    include: { pet: true, owner: true, _count: { select: { requests: true } } },
    orderBy: { createdAt: "desc" },
  });

  const otherPosts = await prisma.adoptionPost.findMany({
    where: { status: "OPEN", ownerId: { not: user.id } },
    include: { pet: true, owner: true, _count: { select: { requests: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-10">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold">Pet Adoption</h1>
          <p className="text-sm text-gray-400 mt-1">Give a pet a forever home — or find one that needs yours</p>
        </div>
        <Link href="/adoption/new" className="inline-flex items-center gap-2 bg-[#2D5016] text-white px-5 py-2.5 rounded-full text-sm font-medium hover:bg-[#4A7C28] transition-all">
          <Plus className="w-4 h-4" /> Post for Adoption
        </Link>
      </div>

      {myPosts.length > 0 && (
        <div className="space-y-4">
          <h2 className="font-display text-2xl font-bold">Your Posts</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {myPosts.map((post) => (
              <div key={post.id} className="bg-white rounded-2xl border border-black/[0.06] overflow-hidden hover:-translate-y-1 hover:shadow-xl hover:shadow-black/5 transition-all">
                <div className="h-36 bg-blue-50 flex items-center justify-center text-7xl border-b border-black/[0.06]">
                  {petEmoji[post.pet.species.toLowerCase()] ?? "🐾"}
                </div>
                <div className="p-5">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-display text-xl font-semibold">{post.pet.name}</h3>
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${post.status === "OPEN" ? "bg-green-100 text-green-700" : post.status === "PENDING" ? "bg-yellow-100 text-yellow-700" : "bg-gray-100 text-gray-700"}`}>
                      {post.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400 mb-1">{post.pet.breed ?? post.pet.species} · {post.type === "PERMANENT" ? "Permanent" : "Foster"}</p>
                  <p className="text-sm text-gray-600 line-clamp-2 mb-4">{post.reason}</p>
                  <div className="flex items-center justify-between mt-4">
                    <span className="text-xs text-gray-400 font-medium">{post._count.requests} request(s)</span>
                    <div className="flex gap-2">
                      <Link href={`/adoption/${post.id}/edit`} className="text-xs bg-amber-100 text-amber-700 px-3 py-1.5 rounded-full font-medium hover:bg-amber-200 transition-colors">
                        Edit
                      </Link>
                      <Link href={`/adoption/${post.id}`} className="text-xs bg-blue-100 text-blue-700 px-3 py-1.5 rounded-full font-medium hover:bg-blue-200 transition-colors">
                        Manage
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-4">
        {myPosts.length > 0 && <h2 className="font-display text-2xl font-bold">Available for Adoption</h2>}
        {otherPosts.length === 0 ? (
          <div className="bg-white rounded-2xl border border-black/[0.06] p-16 text-center">
            <div className="text-6xl mb-4">❤️</div>
            <h2 className="font-display text-xl font-semibold mb-2">No pets available right now</h2>
            <p className="text-gray-400 text-sm mb-6">Check back soon, or post a pet for adoption.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {otherPosts.map((post) => (
              <div key={post.id} className="bg-white rounded-2xl border border-black/[0.06] overflow-hidden hover:-translate-y-1 hover:shadow-xl hover:shadow-black/5 transition-all">
                <div className="h-36 bg-[#FAF7F2] flex items-center justify-center text-7xl border-b border-black/[0.06]">
                  {petEmoji[post.pet.species.toLowerCase()] ?? "🐾"}
                </div>
                <div className="p-5">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-display text-xl font-semibold">{post.pet.name}</h3>
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${post.type === "PERMANENT" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"}`}>
                      {post.type === "PERMANENT" ? "Permanent" : "Foster"}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400 mb-1">{post.pet.breed ?? post.pet.species} · {post.pet.gender.charAt(0) + post.pet.gender.slice(1).toLowerCase()}</p>
                  <p className="text-xs text-gray-300 mb-3">📍 {post.owner.city ?? "Bangladesh"} · Posted {formatDate(post.createdAt)}</p>
                  <p className="text-sm text-gray-600 line-clamp-2 mb-4">{post.reason}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">{post._count.requests} request{post._count.requests !== 1 ? "s" : ""}</span>
                    <Link href={`/adoption/${post.id}`}
                      className="text-sm bg-[#2D5016] text-white px-4 py-2 rounded-full font-medium hover:bg-[#4A7C28] transition-all">
                      Request Adoption
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
