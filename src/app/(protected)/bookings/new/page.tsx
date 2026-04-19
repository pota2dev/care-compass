import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import NewBookingForm from "@/components/bookings/NewBookingForm";
import { BookingType } from "@prisma/client";

const TYPE_META: Record<string, { label: string; emoji: string; providerType: string }> = {
  vet:      { label: "Vet Appointment",  emoji: "🏥", providerType: "VET_CLINIC" },
  grooming: { label: "Pet Grooming",     emoji: "✂️", providerType: "GROOMING"  },
  daycare:  { label: "Pet Daycare",      emoji: "🏡", providerType: "DAYCARE"   },
};

const BOOKING_TYPE_MAP: Record<string, BookingType> = {
  vet:      "VET_APPOINTMENT",
  grooming: "GROOMING",
  daycare:  "DAYCARE",
};

export default async function NewBookingPage(props: {
  searchParams: Promise<{ type?: string }>;
}) {
  const searchParams = await props.searchParams;
  const clerkUser = await currentUser();
  if (!clerkUser) redirect("/sign-in");

  // Default to vet if no type specified
  const typeKey = searchParams.type ?? "vet";
  const meta = TYPE_META[typeKey] ?? TYPE_META.vet;
  const bookingType = BOOKING_TYPE_MAP[typeKey] ?? "VET_APPOINTMENT";

  const user = await prisma.user.findUnique({ where: { clerkId: clerkUser.id } });
  if (!user) redirect("/sign-in");

  // Fetch user's pets
  const pets = await prisma.pet.findMany({
    where: { ownerId: user.id, isActive: true },
    select: { id: true, name: true, species: true },
  });

  // Fetch matching providers with available timeslots
  const providers = await prisma.serviceProvider.findMany({
    where: {
      type: meta.providerType as any,
      isActive: true,
    },
    include: {
      timeslots: {
        where: {
          isAvailable: true,
          startTime: { gte: new Date() },
        },
        orderBy: { startTime: "asc" },
        take: 20,
      },
    },
  });

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-3xl">{meta.emoji}</span>
          <h1 className="font-display text-3xl font-bold text-gray-900">
            Book {meta.label}
          </h1>
        </div>
        <p className="text-sm text-forest-400/60 ml-12">
          Choose a provider, pick a time, and confirm your booking.
        </p>
      </div>

      {/* Type switcher */}
      <div className="flex gap-2 mb-8">
        {Object.entries(TYPE_META).map(([key, m]) => (
          <a
            key={key}
            href={`/bookings/new?type=${key}`}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border transition-all ${
              typeKey === key
                ? "bg-forest-500 text-white border-forest-500"
                : "bg-white text-forest-400/70 border-forest-500/15 hover:border-forest-500/30"
            }`}
          >
            <span>{m.emoji}</span> {m.label}
          </a>
        ))}
      </div>

      {pets.length === 0 ? (
        <div className="bg-white border border-dashed border-forest-500/20 rounded-2xl p-12 text-center">
          <div className="text-4xl mb-4">🐾</div>
          <h3 className="font-display text-xl font-semibold mb-2">No pets registered</h3>
          <p className="text-sm text-forest-400/60 mb-6">
            You need to add a pet before making a booking.
          </p>
          <a
            href="/pets/new"
            className="inline-flex items-center gap-2 bg-forest-500 text-white px-6 py-3 rounded-xl text-sm font-medium hover:bg-forest-400 transition-all"
          >
            Add a Pet First
          </a>
        </div>
      ) : providers.length === 0 ? (
        <div className="bg-white border border-dashed border-forest-500/20 rounded-2xl p-12 text-center">
          <div className="text-4xl mb-4">{meta.emoji}</div>
          <h3 className="font-display text-xl font-semibold mb-2">No providers available</h3>
          <p className="text-sm text-forest-400/60">
            There are no {meta.label.toLowerCase()} providers registered yet. Check back soon!
          </p>
        </div>
      ) : (
        <NewBookingForm
          pets={pets}
          providers={providers}
          bookingType={bookingType}
          typeKey={typeKey}
        />
      )}
    </div>
  );
}
