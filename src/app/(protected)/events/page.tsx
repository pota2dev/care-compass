import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Plus } from "lucide-react";
import EventCard from "@/components/events/EventCard";

export const metadata = { title: "Community Events" };

export default async function EventsPage(props: { searchParams: Promise<{ category?: string }> }) {
  const searchParams = await props.searchParams;
  const clerkUser = await currentUser();
  if (!clerkUser) redirect("/sign-in");
  const user = await prisma.user.findUnique({ where: { clerkId: clerkUser.id } });
  if (!user) redirect("/sign-in");

  const events = await prisma.event.findMany({
    where: {
      isActive: true,
      startDate: { gte: new Date() },
      ...(searchParams.category ? { category: searchParams.category as never } : {}),
    },
    include: {
      creator: true,
      _count: { select: { rsvps: true } },
      rsvps: { where: { userId: user.id } },
    },
    orderBy: { startDate: "asc" },
  });

  const categories = ["MEETUP", "ADOPTION_FAIR", "VACCINATION_CAMP", "TRAINING_WORKSHOP", "PET_SHOW"];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold">Community Events</h1>
          <p className="text-sm text-gray-400 mt-1">Find and join local pet meetups and events</p>
        </div>
        <Link href="/events/new" className="inline-flex items-center gap-2 bg-[#2D5016] text-white px-5 py-2.5 rounded-full text-sm font-medium hover:bg-[#4A7C28] transition-all">
          <Plus className="w-4 h-4" /> Create Event
        </Link>
      </div>

      {/* Category filters */}
      <div className="flex items-center gap-2 flex-wrap">
        <Link href="/events"
          className={`px-4 py-2 rounded-full text-xs font-medium border transition-all ${!searchParams.category ? "bg-[#2D5016] text-white border-[#2D5016]" : "bg-white text-gray-500 border-black/[0.08] hover:border-[#2D5016]"}`}>
          All Events
        </Link>
        {categories.map((cat) => (
          <Link key={cat} href={`/events?category=${cat}`}
            className={`px-4 py-2 rounded-full text-xs font-medium border transition-all ${searchParams.category === cat ? "bg-[#2D5016] text-white border-[#2D5016]" : "bg-white text-gray-500 border-black/[0.08] hover:border-[#2D5016]"}`}>
            {cat.replace(/_/g, " ").charAt(0) + cat.replace(/_/g, " ").slice(1).toLowerCase()}
          </Link>
        ))}
      </div>

      {events.length === 0 ? (
        <div className="bg-white rounded-2xl border border-black/[0.06] p-16 text-center">
          <div className="text-6xl mb-4">🎪</div>
          <h2 className="font-display text-xl font-semibold mb-2">No events found</h2>
          <p className="text-gray-400 text-sm mb-6">Be the first to create an event in your area!</p>
          <Link href="/events/new" className="inline-flex items-center gap-2 bg-[#2D5016] text-white px-6 py-3 rounded-full font-medium hover:bg-[#4A7C28] transition-all">
            <Plus className="w-4 h-4" /> Create Event
          </Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-5">
          {events.map((event) => (
            <EventCard key={event.id} event={event} userId={user.id} isJoined={event.rsvps.length > 0} />
          ))}
        </div>
      )}
    </div>
  );
}
