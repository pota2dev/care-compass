import { auth, currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendBookingConfirmationEmail } from "@/lib/email";
import { z } from "zod";

const createBookingSchema = z.object({
  petId:         z.string(),
  providerId:    z.string(),
  timeslotId:    z.string(),
  type:          z.enum(["VET_APPOINTMENT", "GROOMING", "DAYCARE"]),
  notes:         z.string().optional(),
  isHomeService: z.boolean().optional(),
  homeAddress:   z.string().optional(),
});

export async function GET() {
  const { userId: clerkId } = await auth();
  if (!clerkId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { clerkId } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const bookings = await prisma.booking.findMany({
    where: { userId: user.id },
    include: { provider: true, pet: true, timeslot: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(bookings);
}

export async function POST(req: NextRequest) {
  const [{ userId: clerkId }, clerkUser] = await Promise.all([
    auth(),
    currentUser(),
  ]);

  if (!clerkId || !clerkUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const clerkEmail = clerkUser.emailAddresses[0]?.emailAddress ?? "";
  const clerkName  = clerkUser.fullName ?? clerkUser.firstName ?? "there";

  const user = await prisma.user.findUnique({ where: { clerkId } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const body = await req.json();
  const parsed = createBookingSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const timeslot = await prisma.timeslot.findUnique({
    where: { id: parsed.data.timeslotId },
  });
  if (!timeslot || !timeslot.isAvailable || timeslot.bookedCount >= timeslot.maxCapacity) {
    return NextResponse.json({ error: "Timeslot not available" }, { status: 409 });
  }

  // Store home address inside notes field — no schema change needed
  const finalNotes = parsed.data.isHomeService && parsed.data.homeAddress
    ? `HOME SERVICE — Address: ${parsed.data.homeAddress}${parsed.data.notes ? `. Notes: ${parsed.data.notes}` : ""}`
    : parsed.data.notes ?? null;

  const booking = await prisma.$transaction(async (tx) => {
    const newBooking = await tx.booking.create({
      data: {
        petId:         parsed.data.petId,
        providerId:    parsed.data.providerId,
        timeslotId:    parsed.data.timeslotId,
        type:          parsed.data.type,
        userId:        user.id,
        status:        "CONFIRMED",
        isHomeService: parsed.data.isHomeService ?? false,
        notes:         finalNotes,
      },
      include: { provider: true, pet: true, timeslot: true },
    });

    const newCount = timeslot.bookedCount + 1;
    await tx.timeslot.update({
      where: { id: parsed.data.timeslotId },
      data: {
        bookedCount: newCount,
        isAvailable: newCount < timeslot.maxCapacity,
      },
    });

    await tx.notification.create({
      data: {
        userId:  user.id,
        type:    "BOOKING_CONFIRMED",
        title:   "Booking Confirmed",
        message: `Your ${parsed.data.type.replace("_", " ").toLowerCase()} for ${newBooking.pet.name} is confirmed.`,
        link:    `/bookings`,
      },
    });

    return newBooking;
  });

  const dateTime = new Date(booking.timeslot.startTime).toLocaleString("en-BD", {
    weekday: "long", year: "numeric", month: "long",
    day: "numeric", hour: "2-digit", minute: "2-digit",
  });

  sendBookingConfirmationEmail({
    to:              clerkEmail,
    userName:        clerkName,
    petName:         booking.pet.name,
    serviceType:     booking.type,
    providerName:    booking.provider.name,
    providerAddress: booking.provider.address,
    dateTime,
    bookingId:       booking.id,
    isHomeService:   booking.isHomeService,
    homeAddress:     parsed.data.homeAddress,
  }).catch((err) => console.error("Booking email error:", err));

  return NextResponse.json(booking, { status: 201 });
}
