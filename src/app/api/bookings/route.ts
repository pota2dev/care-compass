import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendBookingConfirmationSMS } from "@/lib/twilio";
import { z } from "zod";

const createBookingSchema = z.object({
  petId: z.string(),
  providerId: z.string(),
  timeslotId: z.string(),
  type: z.enum(["VET_APPOINTMENT", "GROOMING", "DAYCARE"]),
  notes: z.string().optional(),
  isHomeService: z.boolean().optional(),
});

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const bookings = await prisma.booking.findMany({
    where: { userId: user.id },
    include: { provider: true, pet: true, timeslot: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(bookings);
}

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const body = await req.json();
  const parsed = createBookingSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  // Check timeslot availability
  const timeslot = await prisma.timeslot.findUnique({ where: { id: parsed.data.timeslotId } });
  if (!timeslot || !timeslot.isAvailable || timeslot.bookedCount >= timeslot.maxCapacity) {
    return NextResponse.json({ error: "Timeslot not available" }, { status: 409 });
  }

  // Create booking + update timeslot in transaction
  const booking = await prisma.$transaction(async (tx) => {
    const newBooking = await tx.booking.create({
      data: {
        ...parsed.data,
        userId: user.id,
        status: "CONFIRMED",
      },
      include: { provider: true, pet: true, timeslot: true },
    });

    await tx.timeslot.update({
      where: { id: parsed.data.timeslotId },
      data: {
        bookedCount: { increment: 1 },
        isAvailable: timeslot.bookedCount + 1 < timeslot.maxCapacity,
      },
    });

    // Create notification
    await tx.notification.create({
      data: {
        userId: user.id,
        type: "BOOKING_CONFIRMED",
        title: "Booking Confirmed",
        message: `Your ${parsed.data.type.replace("_", " ").toLowerCase()} for ${newBooking.pet.name} has been confirmed.`,
        link: `/bookings/${newBooking.id}`,
      },
    });

    return newBooking;
  });

  // Send SMS if user has phone
  if (user.phone) {
    await sendBookingConfirmationSMS(
      user.phone,
      booking.pet.name,
      booking.type.replace("_", " "),
      booking.timeslot.startTime.toLocaleString()
    );
  }

  return NextResponse.json(booking, { status: 201 });
}
