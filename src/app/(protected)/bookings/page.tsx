import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Plus, CalendarDays } from "lucide-react";
import { formatDateTime, formatCurrency } from "@/lib/utils";

const STATUS_STYLE: Record<string, string> = {
  CONFIRMED: "bg-forest-100 text-forest-500",
  PENDING: "bg-amber-light text-amber-dark",
  CANCELLED: "bg-clay-light text-clay",
  COMPLETED: "bg-gray-100 text-gray-500",
  NO_SHOW: "bg-gray-100 text-gray-500",
};

const TYPE_EMOJI: Record<string, string> = {
  VET_APPOINTMENT: "🏥",
  GROOMING: "✂️",
  DAYCARE: "🏡",
};

const TYPE_LABEL: Record<string, string> = {
  VET_APPOINTMENT: "Vet Appointment",
  GROOMING: "Grooming",
  DAYCARE: "Daycare",
};

export default async function BookingsPage() {
  const clerkUser = await currentUser();
  if (!clerkUser) return null;

  const user = await prisma.user.findUnique({ where: { clerkId: clerkUser.id } });
  if (!user) return null;

  const bookings = await prisma.booking.findMany({
    where: { userId: user.id },
    include: { provider: true, pet: true, timeslot: true },
    orderBy: { createdAt: "desc" },
  });

  const upcoming = bookings.filter((b) => ["PENDING", "CONFIRMED"].includes(b.status));
  const past = bookings.filter((b) => ["COMPLETED", "CANCELLED", "NO_SHOW"].includes(b.status));

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold text-gray-900">My Bookings</h1>
          <p className="text-sm text-forest-400/60 mt-1">{upcoming.length} upcoming · {past.length} past</p>
        </div>
        <Link href="/bookings/new"
          className="inline-flex items-center gap-2 bg-forest-500 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-forest-400 transition-all">
          <Plus className="w-4 h-4" /> New Booking
        </Link>
      </div>

      {bookings.length === 0 ? (
        <div className="bg-white border border-dashed border-forest-500/20 rounded-2xl p-16 text-center">
          <CalendarDays className="w-12 h-12 text-forest-500/20 mx-auto mb-4" />
          <h3 className="font-display text-xl font-semibold mb-2">No bookings yet</h3>
          <p className="text-sm text-forest-400/60 mb-6">Book a vet, groomer, or daycare for your pet.</p>
          <Link href="/bookings/new" className="inline-flex items-center gap-2 bg-forest-500 text-white px-6 py-3 rounded-xl text-sm font-medium">
            <Plus className="w-4 h-4" /> Create First Booking
          </Link>
        </div>
      ) : (
        <div className="space-y-8">
          {upcoming.length > 0 && (
            <div>
              <h2 className="font-display text-lg font-semibold text-gray-900 mb-4">Upcoming</h2>
              <div className="space-y-3">
                {upcoming.map((b) => (
                  <BookingRow key={b.id} booking={b} />
                ))}
              </div>
            </div>
          )}
          {past.length > 0 && (
            <div>
              <h2 className="font-display text-lg font-semibold text-gray-500 mb-4">Past Bookings</h2>
              <div className="space-y-3 opacity-70">
                {past.map((b) => (
                  <BookingRow key={b.id} booking={b} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function BookingRow({ booking }: { booking: any }) {
  return (
    <div className="bg-white border border-forest-500/10 rounded-2xl p-5 flex items-center gap-4">
      <div className="w-12 h-12 bg-forest-50 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
        {TYPE_EMOJI[booking.type]}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-sm font-medium text-gray-900">{TYPE_LABEL[booking.type]}</span>
          <span className="text-forest-400/40">·</span>
          <span className="text-sm text-forest-400/70">{booking.pet.name}</span>
        </div>
        <div className="text-xs text-forest-400/60">{booking.provider.name}</div>
        <div className="text-xs text-forest-400/50 mt-1">{formatDateTime(booking.timeslot.startTime)}</div>
      </div>
      {booking.totalAmount > 0 && (
        <div className="text-right">
          <div className="font-display text-base font-semibold text-forest-500">{formatCurrency(booking.totalAmount)}</div>
          <div className="text-[10px] text-forest-400/50">{booking.isPaid ? "Paid" : "Unpaid"}</div>
        </div>
      )}
      <span className={`text-[11px] font-medium px-3 py-1 rounded-full flex-shrink-0 ${STATUS_STYLE[booking.status]}`}>
        {booking.status}
      </span>
    </div>
  );
}
