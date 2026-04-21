import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import EditEventForm from "@/components/events/EditEventForm";

export default async function EditEventPage({ params }: { params: Promise<{ id: string }> }) {
  const clerkUser = await currentUser();
  if (!clerkUser) redirect("/sign-in");

  const user = await prisma.user.findUnique({ where: { clerkId: clerkUser.id } });
  if (!user) redirect("/sign-in");

  const resolvedParams = await params;

  const event = await prisma.event.findUnique({
    where: { id: resolvedParams.id },
  });

  if (!event || event.creatorId !== user.id) redirect("/events");

  return <EditEventForm event={event} />;
}
