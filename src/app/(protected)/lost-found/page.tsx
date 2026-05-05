import { getLostFoundPosts } from "@/actions/lost-found";
import MapView from "@/components/map-view";
import Link from "next/link";
import { LostFoundType } from "@prisma/client";
import { formatDistanceToNow } from "date-fns";
import Image from "next/image";
import { Plus } from "lucide-react";
import SearchForm from "./search-form";

export default async function LostFoundPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; city?: string; species?: string; view?: string }>;
}) {
  const resolvedParams = await searchParams;
  const typeFilter = (resolvedParams.type as LostFoundType) || undefined;
  
  const posts = await getLostFoundPosts({
    type: typeFilter,
    city: resolvedParams.city,
    species: resolvedParams.species,
  });

  const isMapView = resolvedParams.view === "map";

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 tracking-tight">Lost & Found Pets</h1>
          <p className="text-gray-500 mt-2">Help reunite lost pets with their families, or post rescued ones.</p>
        </div>
        <Link 
          href="/lost-found/new" 
          className="bg-forest-600 hover:bg-forest-700 text-white px-5 py-2.5 rounded-lg flex items-center gap-2 font-medium transition-colors"
        >
          <Plus className="w-5 h-5" />
          Report Lost/Found Pet
        </Link>
      </div>

      <SearchForm />

      {isMapView ? (
        <MapView pets={posts} className="w-full h-[600px]" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.length === 0 ? (
            <div className="col-span-full py-12 text-center text-gray-500">
              No posts found matching your criteria.
            </div>
          ) : (
            posts.map((post) => (
              <Link key={post.id} href={`/lost-found/${post.id}`}>
                <div className="group bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                  <div className="aspect-[4/3] bg-gray-100 relative">
                    {post.imageUrl ? (
                      <Image 
                        src={post.imageUrl} 
                        alt={post.petName || "Pet"} 
                        fill 
                        className="object-cover group-hover:scale-105 transition-transform duration-300" 
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        No Image
                      </div>
                    )}
                    <div className="absolute top-3 left-3 flex gap-2">
                      <span className={`px-2.5 py-1 text-xs font-bold rounded-full uppercase tracking-wider ${
                        post.type === 'LOST' 
                          ? 'bg-red-500 text-white' 
                          : 'bg-green-500 text-white'
                      }`}>
                        {post.type}
                      </span>
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="text-xl font-bold text-gray-900 mb-1">
                      {post.petName || `Unknown ${post.species}`}
                    </h3>
                    <p className="text-gray-500 text-sm mb-4">
                      {post.location}, {post.city}
                    </p>
                    
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-gray-200 overflow-hidden relative">
                        {post.reporter.avatarUrl && (
                          <Image src={post.reporter.avatarUrl} alt="Reporter" fill className="object-cover" />
                        )}
                      </div>
                      <div className="text-sm">
                        <p className="font-medium text-gray-900">{post.reporter.name}</p>
                        <p className="text-gray-500 text-xs">
                          {formatDistanceToNow(new Date(post.dateLostOrFound))} ago
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      )}
    </div>
  );
}
