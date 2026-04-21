import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendVaccinationReminder } from "@/lib/mail";

// This endpoint can be triggered by a cron job (e.g. Vercel Cron)
// Add your own secret checking logic if exposing to the internet!
export async function GET(request: Request) {
  try {
    // Basic security check (optional, but recommended in prod)
    const { searchParams } = new URL(request.url);
    const secret = searchParams.get("secret");
    // if (secret !== process.env.CRON_SECRET) {
    //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    // }

    const today = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);

    // Find vaccinations due in the next 7 days
    const upcomingVaccinations = await prisma.healthRecord.findMany({
      where: {
        type: "VACCINATION",
        nextDueDate: {
          not: null,
          gte: today,
          lte: nextWeek,
        },
      },
      include: {
        pet: {
          include: {
            owner: true,
          },
        },
      },
    });

    let sentCount = 0;

    for (const record of upcomingVaccinations) {
      if (record.pet.owner.email && record.nextDueDate) {
        
        // Let's create an in-app notification as well!
        await prisma.notification.create({
          data: {
            userId: record.pet.ownerId,
            type: "HEALTH_REMINDER",
            title: "Vaccination Reminder",
            message: `${record.pet.name} is due for ${record.title || record.type} on ${record.nextDueDate.toLocaleDateString()}.`,
            link: `/pets/${record.pet.id}`,
          }
        });

        // Send Email via Nodemailer
        const sent = await sendVaccinationReminder(
          record.pet.owner.email,
          record.pet.name,
          record.title || "Vaccination",
          record.nextDueDate
        );

        if (sent) sentCount++;
      }
    }

    return NextResponse.json({
      success: true,
      found: upcomingVaccinations.length,
      sent: sentCount,
    });
  } catch (error: any) {
    console.error("Cron Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
