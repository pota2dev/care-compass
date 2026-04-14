import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import RescueClient from "@/components/rescue/RescueClient";

export default async function RescuePage() {
  const clerkUser = await currentUser();
  const user = clerkUser
    ? await prisma.user.findUnique({ where: { clerkId: clerkUser.id } })
    : null;

  // Fetch rescue organizations
  const organizations = await prisma.serviceProvider.findMany({
    where: { type: "RESCUE", isActive: true },
    select: {
      id: true,
      name: true,
      phone: true,
      address: true,
      city: true,
      rating: true,
    },
    orderBy: { rating: "desc" },
  });

  // Fetch recent rescue reports
  const recentReports = await prisma.rescueReport.findMany({
    orderBy: { createdAt: "desc" },
    take: 10,
    select: {
      id: true,
      animalType: true,
      condition: true,
      location: true,
      city: true,
      latitude: true,
      longitude: true,
      urgency: true,
      status: true,
      description: true,
      createdAt: true,
      reporter: { select: { name: true } },
    },
  });

  return (
    <RescueClient
      userId={user?.id ?? null}
      organizations={organizations}
      recentReports={recentReports}
    />
  );
}
