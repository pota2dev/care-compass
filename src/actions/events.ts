"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createCommunityEvent(data: any) {
  try {
    //Create the Event in the database
    const newEvent = await prisma.event.create({
      data: {
        title: data.title,
        description: data.description,
        startDate: new Date(data.startDate),
        city: data.city,
        category: data.category,
        isActive: true,
      },
    });

    //Notify users
    const allUsers = await prisma.user.findMany({
      select: { id: true }
    });

    //Create notifications for all users in one go
    if (allUsers.length > 0) {
      await prisma.notification.createMany({
        data: allUsers.map((user) => ({
          userId: user.id,
          type: "NEW_EVENT",
          title: "New Event Nearby! 🐾",
          message: `${newEvent.title} is happening in ${newEvent.city || 'your area'}.`,
          link: `/events`,
          isRead: false,
        })),
      });
    }

    revalidatePath("/events");
    revalidatePath("/notifications");
    revalidatePath("/calendar");

    return { success: true, eventId: newEvent.id };
  } catch (error) {
    console.error("Error creating event/notification:", error);
    return { success: false };
  }
}