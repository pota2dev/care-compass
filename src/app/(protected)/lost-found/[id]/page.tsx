import { getLostFoundPostById, resolveLostFoundPost } from "@/actions/lost-found";
import { formatDistanceToNow } from "date-fns";
import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { MapPin, User as UserIcon, Calendar, ArrowLeft, CheckCircle } from "lucide-react";
import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export default async function LostFoundDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  const post = await getLostFoundPostById(resolvedParams.id);

  if (!post) {
    notFound();
  }

  const clerkUser = await currentUser();
  const dbUser = clerkUser ? await prisma.user.findUnique({ where: { clerkId: clerkUser.id } }) : null;
  const isOwner = dbUser?.id === post.reporterId;

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <Link href="/lost-found" className="text-gray-500 hover:text-gray-900 inline-flex items-center gap-2 mb-6 font-medium transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Back to Registry
      </Link>

      <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
        <div className="w-full h-80 md:h-96 relative bg-gray-100">
          {post.imageUrl ? (
            <Image src={post.imageUrl} alt={post.petName || "Pet"} fill className="object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              No Image Provided
            </div>
          )}
          <div className="absolute top-4 left-4 flex gap-2">
            <span className={`px-4 py-1.5 text-sm font-bold rounded-full uppercase tracking-wider shadow-sm ${
              post.type === 'LOST' ? 'bg-red-500 text-white' : 'bg-green-500 text-white'
            }`}>
              {post.type}
            </span>
            {post.status === 'RESOLVED' && (
              <span className="px-4 py-1.5 text-sm font-bold rounded-full uppercase tracking-wider bg-blue-500 text-white shadow-sm flex items-center gap-1">
                <CheckCircle className="w-4 h-4" />
                Resolved
              </span>
            )}
          </div>
        </div>

        <div className="p-6 md:p-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {post.petName || `Unknown ${post.species}`}
              </h1>
              <div className="flex items-center text-gray-500 gap-4 text-sm font-medium">
                <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {post.location}, {post.city}</span>
                <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {formatDistanceToNow(new Date(post.dateLostOrFound))} ago</span>
              </div>
            </div>
            
            {isOwner && post.status === 'OPEN' && (
              <form action={async () => {
                "use server";
                await resolveLostFoundPost(post.id);
                redirect("/lost-found");
              }}>
                <button className="bg-forest-600 hover:bg-forest-700 text-white px-5 py-2.5 rounded-lg flex items-center gap-2 font-medium transition-colors">
                  <CheckCircle className="w-5 h-5" />
                  Mark as Resolved
                </button>
              </form>
            )}
          </div>

          <div className="prose max-w-none text-gray-700 bg-gray-50 p-6 rounded-xl border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
            <p className="whitespace-pre-wrap">{post.description || "No description provided."}</p>
          </div>

          <hr className="my-8 border-gray-100" />

          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">Contact Reporter</h3>
            <div className="flex items-center gap-4 bg-white border border-gray-200 p-4 rounded-xl shadow-sm">
              <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden relative border border-gray-200">
                {post.reporter.avatarUrl ? (
                  <Image src={post.reporter.avatarUrl} alt={post.reporter.name} fill className="object-cover" />
                ) : (
                  <UserIcon className="w-6 h-6 text-gray-400" />
                )}
              </div>
              <div>
                <p className="font-semibold text-gray-900 text-lg">{post.reporter.name}</p>
                <div className="flex flex-wrap gap-2 text-sm mt-1">
                  {post.reporter.phone && (
                    <a href={`tel:${post.reporter.phone}`} className="text-forest-600 hover:underline font-medium bg-forest-50 px-2 py-0.5 rounded">
                      {post.reporter.phone}
                    </a>
                  )}
                  {post.reporter.email && (
                    <a href={`mailto:${post.reporter.email}`} className="text-forest-600 hover:underline font-medium bg-forest-50 px-2 py-0.5 rounded">
                      {post.reporter.email}
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
