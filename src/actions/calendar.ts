"use server";

import { prisma } from "@/lib/prisma";

/**
 * Calendarific API.
 */
export async function getHolidays() {
  const API_KEY = process.env.CALENDARIFIC_API_KEY;
  const YEAR = new Date().getFullYear(); 
  
  try {
    const res = await fetch(
      `https://calendarific.com/api/v2/holidays?api_key=${API_KEY}&country=BD&year=${YEAR}&type=national`,
      { next: { revalidate: 86400 } } 
    );

    if (!res.ok) throw new Error("Failed to fetch holidays");

    const data = await res.json();
    return data.response.holidays;
  } catch (error) {
    console.error("Calendarific Error:", error);
    return [];
  }
}

/**
 * Community events.
 */
export async function getAppEvents() {
  try {
    const events = await prisma.event.findMany({
      where: { 
        isActive: true 
      },
      select: {
        id: true,
        title: true,
        startDate: true,
        category: true,
        city: true,
        description: true,
      },
      orderBy: {
        startDate: 'asc'
      }
    });

    return events;
  } catch (error) {
    console.error("Prisma Fetch Error:", error);
    return [];
  }
}