import { auth, currentUser } from "@clerk/nextjs/server";
import { sendBookingConfirmationEmail } from "@/lib/email";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createBookingSchema = z.object({
  type: z.enum(["VET_APPOINTMENT", "GROOMING", "DAYCARE"]),
  timeslotId: z.string(),
  petId: z.string(),
  providerId: z.string(),
  isHomeService: z.boolean().optional(),
  homeAddress: z.string().optional(),
  notes: z.string().optional(),
  totalAmount: z.number().optional()
});
export async function POST(req: NextRequest) {
  const [{ userId: clerkId }, clerkUser] = await Promise.all([
    auth(),
    currentUser(),
  ]);

  if (!clerkId || !clerkUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const clerkEmail = clerkUser.emailAddresses[0]?.emailAddress ?? "";
  const clerkName  = clerkUser.fullName ?? clerkUser.firstName ?? "there";

  const user = await prisma.user.findUnique({ where: { clerkId } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const body = await req.json();
  const parsed = createBookingSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const timeslot = await prisma.timeslot.findUnique({ where: { id: parsed.data.timeslotId } });
  if (!timeslot || !timeslot.isAvailable || timeslot.bookedCount >= timeslot.maxCapacity) {
    return NextResponse.json({ error: "Timeslot not available" }, { status: 409 });
  }

  const booking = await prisma.$transaction(async (tx) => {
    const { homeAddress, notes, ...restData } = parsed.data;
    let combinedNotes = notes || null;
    if (homeAddress) {
      combinedNotes = combinedNotes ? `${combinedNotes}\nHome Address: ${homeAddress}` : `Home Address: ${homeAddress}`;
    }

    const newBooking = await tx.booking.create({
      data: {
        ...restData,
        notes: combinedNotes,
        userId: user.id,
        status: "CONFIRMED",
        isHomeService: parsed.data.isHomeService ?? false,
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
        userId: user.id,
        type: "BOOKING_CONFIRMED",
        title: "Booking Confirmed",
        message: `Your ${parsed.data.type.replace("_", " ").toLowerCase()} for ${newBooking.pet.name} has been confirmed.`,
        link: "/bookings", 
      },
    });

    return newBooking;
  });

  // Email Notification
  const dateTime = new Date(booking.timeslot.startTime).toLocaleString("en-BD", {
    weekday: "long", year: "numeric", month: "long",
    day: "numeric", hour: "2-digit", minute: "2-digit",
  });

  sendBookingConfirmationEmail({
    to: clerkEmail,
    userName: clerkName,
    petName: booking.pet.name,
    serviceType: booking.type,
    providerName: booking.provider.name,
    providerAddress: booking.provider.address,
    dateTime,
    bookingId: booking.id,
    isHomeService: booking.isHomeService,
    homeAddress: parsed.data.homeAddress ?? undefined,
  }).catch((err) => console.error("Booking email error:", err));

  return NextResponse.json(booking, { status: 201 });
}