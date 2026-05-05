import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Plus } from "lucide-react";
import EventCard from "@/components/events/EventCard";
import EventFilters from "@/components/events/EventFilters";

export const metadata = { title: "Community Events" };

export default async function EventsPage(props: { searchParams: Promise<{ category?: string, past?: string, location?: string, date?: string, rsvped?: string }> }) {
  const searchParams = await props.searchParams;
  const clerkUser = await currentUser();
  if (!clerkUser) redirect("/sign-in");
  const user = await prisma.user.findUnique({ where: { clerkId: clerkUser.id } });
  if (!user) redirect("/sign-in");

  // Get distinct cities for filters
  const cityData = await prisma.event.findMany({
    where: { isActive: true },
    select: { city: true },
    distinct: ["city"],
  });
  const cities = cityData.map(c => c.city).filter(Boolean);

  // Parse Date Query
  const now = new Date();
  let startGte: Date | undefined = searchParams.past !== "true" ? new Date() : undefined;
  let startLte: Date | undefined = undefined;

  if (searchParams.date === "today") {
    const todayStart = new Date(now.setHours(0, 0, 0, 0));
    const todayEnd = new Date(now.setHours(23, 59, 59, 999));
    startGte = todayStart;
    startLte = todayEnd;
  } else if (searchParams.date === "upcoming") {
    startGte = new Date();
    startLte = undefined;
  } else if (searchParams.date === "weekend") {
    const d = new Date();
    const day = d.getDay();
    const diffToSat = day <= 6 ? 6 - day : 6; 
    const saturday = new Date(d);
    saturday.setDate(d.getDate() + diffToSat);
    saturday.setHours(0, 0, 0, 0);
    const sunday = new Date(saturday);
    sunday.setDate(saturday.getDate() + 1);
    sunday.setHours(23, 59, 59, 999);
    startGte = saturday;
    startLte = sunday;
  }

  // Base Where Clause
  const feedWhere: any = {
    isActive: true,
    ...(searchParams.category ? { category: searchParams.category as never } : {}),
    ...(searchParams.location ? { city: searchParams.location } : {}),
  };

  if (startGte || startLte) {
    feedWhere.startDate = {};
    if (startGte) feedWhere.startDate.gte = startGte;
    if (startLte) feedWhere.startDate.lte = startLte;
  }

  // If going/attended is checked, user must have an RSVP
  if (searchParams.rsvped === "true") {
    feedWhere.rsvps = { some: { userId: user.id } };
  }

  const myEvents = await prisma.event.findMany({
    where: { creatorId: user.id, isActive: true },
    include: {
      creator: true,
      _count: { select: { rsvps: true } },
      rsvps: { where: { userId: user.id } },
    },
    orderBy: { startDate: "desc" },
  });

  const feedEvents = await prisma.event.findMany({
    where: { ...feedWhere, creatorId: { not: user.id } },
    include: {
      creator: true,
      _count: { select: { rsvps: true } },
      rsvps: { where: { userId: user.id } },
    },
    orderBy: { startDate: searchParams.past === "true" ? "desc" : "asc" },
  });

  const categories = ["MEETUP", "ADOPTION_FAIR", "VACCINATION_CAMP", "TRAINING_WORKSHOP", "PET_SHOW"];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold">Community Events</h1>
          <p className="text-sm text-gray-400 mt-1">Find and join local pet meetups and events</p>
        </div>
        <Link href="/events/new" className="inline-flex items-center gap-2 bg-[#2D5016] text-white px-5 py-2.5 rounded-full text-sm font-medium hover:bg-[#4A7C28] transition-all">
          <Plus className="w-4 h-4" /> Create Event
        </Link>
      </div>

      <EventFilters cities={cities} />

      {/* Category filters */}
      <div className="flex items-center gap-2 flex-wrap">
        <Link href="/events"
          className={`px-4 py-2 rounded-full text-xs font-medium border transition-all ${!searchParams.category ? "bg-[#2D5016] text-white border-[#2D5016]" : "bg-white text-gray-500 border-black/[0.08] hover:border-[#2D5016]"}`}>
          All Categories
        </Link>
        {categories.map((cat) => (
          <Link key={cat} href={`/events?category=${cat}`}
            className={`px-4 py-2 rounded-full text-xs font-medium border transition-all ${searchParams.category === cat ? "bg-[#2D5016] text-white border-[#2D5016]" : "bg-white text-gray-500 border-black/[0.08] hover:border-[#2D5016]"}`}>
            {cat.replace(/_/g, " ").charAt(0) + cat.replace(/_/g, " ").slice(1).toLowerCase()}
          </Link>
        ))}
      </div>

      {myEvents.length > 0 && (
        <div className="space-y-4">
          <h2 className="font-display text-2xl font-bold">Hosting</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {myEvents.map((event) => (
              <EventCard key={event.id} event={event} userId={user.id} isJoined={false} isPast={new Date(event.startDate) < new Date()} isHost={true} />
            ))}
          </div>
        </div>
      )}

      <div className="space-y-4">
        {myEvents.length > 0 && feedEvents.length > 0 && <h2 className="font-display text-2xl font-bold">Discover Events</h2>}
        {feedEvents.length === 0 ? (
          <div className="bg-white rounded-2xl border border-black/[0.06] p-16 text-center">
            <div className="text-6xl mb-4">🎪</div>
            <h2 className="font-display text-xl font-semibold mb-2">No events found</h2>
            <p className="text-gray-400 text-sm mb-6">Change your filters or be the first to create an event!</p>
            <Link href="/events/new" className="inline-flex items-center gap-2 bg-[#2D5016] text-white px-6 py-3 rounded-full font-medium hover:bg-[#4A7C28] transition-all">
              <Plus className="w-4 h-4" /> Create Event
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {feedEvents.map((event) => (
              <EventCard key={event.id} event={event} userId={user.id} isJoined={event.rsvps.length > 0} isPast={new Date(event.startDate) < new Date()} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
