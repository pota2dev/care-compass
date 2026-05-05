import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import Link from "next/link";
import { PawPrint, CalendarCheck, ShoppingCart, CalendarDays, Plus, ArrowRight } from "lucide-react";

export const metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const clerkUser = await currentUser();
  if (!clerkUser) redirect("/sign-in");

  const user = await prisma.user.findUnique({ where: { clerkId: clerkUser.id } });
  if (!user) redirect("/sign-in");

  const [pets, upcomingBookings, recentOrders, nearbyEvents, notifications] = await Promise.all([
    prisma.pet.findMany({ where: { ownerId: user.id, isActive: true }, take: 4 }),
    prisma.booking.findMany({
      where: { userId: user.id, timeslot: { startTime: { gte: new Date() } }, status: { in: ["PENDING", "CONFIRMED"] } },
      include: { pet: true, provider: true, timeslot: true },
      orderBy: { timeslot: { startTime: "asc" } },
      take: 5,
    }),
    prisma.order.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, take: 3 }),
    prisma.event.findMany({
      where: { isActive: true, startDate: { gte: new Date() } },
      include: { _count: { select: { rsvps: true } } },
      orderBy: { startDate: "asc" },
      take: 4,
    }),
    prisma.notification.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, take: 5 }),
  ]);

  const monthSpend = recentOrders.reduce((sum, o) => sum + o.totalAmount, 0);
  const unreadNotifs = notifications.filter((n) => !n.isRead).length;
  const petEmoji: Record<string, string> = { dog: "🐕", cat: "🐈", rabbit: "🐇", bird: "🦜", fish: "🐠" };
  const bookingStatusColor: Record<string, string> = {
    CONFIRMED: "bg-green-100 text-green-700", PENDING: "bg-amber-100 text-amber-700",
    CANCELLED: "bg-red-100 text-red-700", COMPLETED: "bg-gray-100 text-gray-600",
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold text-gray-900">
            Good morning, <span className="text-[#4A7C28] italic">{user.name.split(" ")[0]}</span> 🌿
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            {new Date().toLocaleDateString("en-BD", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          </p>
        </div>
        {unreadNotifs > 0 && (
          <Link href="/profile/notifications"
            className="flex items-center gap-2 bg-white border border-black/[0.08] rounded-xl px-4 py-2.5 text-sm text-gray-600 hover:border-[#2D5016] transition-all">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            {unreadNotifs} new notification{unreadNotifs > 1 ? "s" : ""}
          </Link>
        )}
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: PawPrint, label: "Registered Pets", value: pets.length, color: "text-[#2D5016] bg-[#C8DFB0]" },
          { icon: CalendarCheck, label: "Upcoming Bookings", value: upcomingBookings.length, color: "text-sky-700 bg-sky-100" },
          { icon: ShoppingCart, label: "Monthly Spend", value: formatCurrency(monthSpend), color: "text-amber-700 bg-amber-100" },
          { icon: CalendarDays, label: "Events Near You", value: nearbyEvents.length, color: "text-purple-700 bg-purple-100" },
        ].map((c) => (
          <div key={c.label} className="bg-white rounded-2xl border border-black/[0.06] p-5">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${c.color}`}>
              <c.icon className="w-5 h-5" />
            </div>
            <div className="font-display text-2xl font-bold text-gray-900">{c.value}</div>
            <div className="text-xs text-gray-400 mt-0.5">{c.label}</div>
          </div>
        ))}
      </div>

      {/* Content grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* My Pets */}
          <div className="bg-white rounded-2xl border border-black/[0.06] p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-lg font-semibold">My Pets</h2>
              <Link href="/pets/new" className="flex items-center gap-1 text-xs text-[#4A7C28] font-medium"><Plus className="w-3.5 h-3.5" /> Add Pet</Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {pets.map((pet) => (
                <Link key={pet.id} href={`/pets/${pet.id}`}
                  className="bg-[#FAF7F2] rounded-xl p-4 text-center border border-transparent hover:border-[#C8DFB0] hover:-translate-y-0.5 transition-all">
                  <div className="text-3xl mb-2">{petEmoji[pet.species.toLowerCase()] ?? "🐾"}</div>
                  <div className="text-sm font-medium text-gray-800">{pet.name}</div>
                  <div className="text-xs text-gray-400 mt-0.5">{pet.breed ?? pet.species}</div>
                </Link>
              ))}
              <Link href="/pets/new"
                className="bg-[#FAF7F2] rounded-xl p-4 border border-dashed border-black/15 hover:border-[#4A7C28] transition-all flex flex-col items-center justify-center gap-1">
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">+</div>
                <div className="text-xs text-gray-400">Add Pet</div>
              </Link>
            </div>
          </div>

          {/* Bookings */}
          <div className="bg-white rounded-2xl border border-black/[0.06] p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-lg font-semibold">Upcoming Bookings</h2>
              <Link href="/bookings" className="flex items-center gap-1 text-xs text-[#4A7C28] font-medium">View All <ArrowRight className="w-3.5 h-3.5" /></Link>
            </div>
            {upcomingBookings.length === 0 ? (
              <p className="text-sm text-gray-400 py-6 text-center">No upcoming bookings. <Link href="/bookings/new" className="text-[#4A7C28] underline">Book a service</Link></p>
            ) : (
              <div className="space-y-1">
                {upcomingBookings.map((b) => (
                  <div key={b.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-[#FAF7F2] transition-colors">
                    <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center text-lg flex-shrink-0">
                      {b.type === "VET_APPOINTMENT" ? "🏥" : b.type === "GROOMING" ? "✂️" : "🏡"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{b.provider.name} — {b.pet.name}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{formatDateTime(b.timeslot.startTime)}</p>
                    </div>
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${bookingStatusColor[b.status] ?? "bg-gray-100 text-gray-600"}`}>
                      {b.status.charAt(0) + b.status.slice(1).toLowerCase()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Events */}
          <div className="bg-white rounded-2xl border border-black/[0.06] p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-lg font-semibold">Nearby Events</h2>
              <Link href="/events" className="flex items-center gap-1 text-xs text-[#4A7C28] font-medium">Explore <ArrowRight className="w-3.5 h-3.5" /></Link>
            </div>
            <div className="space-y-3">
              {nearbyEvents.map((event) => (
                <div key={event.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-[#FAF7F2] transition-colors">
                  <div className="w-12 h-12 bg-[#FAF7F2] rounded-xl flex flex-col items-center justify-center border border-black/[0.06] flex-shrink-0">
                    <span className="text-[9px] uppercase tracking-wider text-gray-400">{new Date(event.startDate).toLocaleString("en", { month: "short" })}</span>
                    <span className="font-display text-xl font-bold text-[#2D5016] leading-none">{new Date(event.startDate).getDate()}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{event.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5">📍 {event.location} · {event._count.rsvps} attending</p>
                  </div>
                  <Link href={`/events/${event.id}`} className="text-xs bg-[#C8DFB0] text-[#2D5016] px-3 py-1.5 rounded-full font-medium hover:bg-[#4A7C28] hover:text-white transition-all flex-shrink-0">Join</Link>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right sidebar */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-black/[0.06] p-6">
            <h2 className="font-display text-lg font-semibold mb-4">Quick Actions</h2>
            <div className="space-y-2">
              {[
                ["/bookings/new?type=vet", "🏥 Book Vet Appointment"],
                ["/bookings/new?type=grooming", "✂️ Schedule Grooming"],
                ["/bookings/new?type=daycare", "🏡 Book Daycare"],
                ["/adoption/new", "❤️ Post for Adoption"],
                ["/rescue/new", "🚨 Request Rescue"],
                ["/shop", "🛒 Visit Pet Shop"],
              ].map(([href, label]) => (
                <Link key={href} href={href}
                  className="flex items-center gap-3 w-full p-3 rounded-xl text-sm text-gray-600 border border-transparent hover:border-[#C8DFB0] hover:bg-[#FAF7F2] hover:text-[#2D5016] transition-all">
                  {label}
                </Link>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-black/[0.06] p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-lg font-semibold">Notifications</h2>
              <Link href="/profile/notifications" className="text-xs text-[#4A7C28] font-medium">View All</Link>
            </div>
            {notifications.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">All caught up! 🎉</p>
            ) : (
              <div className="space-y-3">
                {notifications.map((n) => (
                  <div key={n.id} className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center text-sm flex-shrink-0 mt-0.5">
                      {n.type.includes("BOOKING") ? "📅" : n.type.includes("ORDER") ? "📦" : "🔔"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-600 leading-relaxed">{n.message}</p>
                      <p className="text-[10px] text-gray-300 mt-1">{new Date(n.createdAt).toLocaleDateString("en-BD")}</p>
                    </div>
                    {!n.isRead && <div className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5 flex-shrink-0" />}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
