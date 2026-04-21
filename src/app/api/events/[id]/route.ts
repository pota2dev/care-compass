import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const clerkUser = await currentUser();
    if (!clerkUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await prisma.user.findUnique({ where: { clerkId: clerkUser.id } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const resolvedParams = await params;
    
    const event = await prisma.event.findUnique({ where: { id: resolvedParams.id } });
    if (!event) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (event.creatorId !== user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    await prisma.event.delete({ where: { id: resolvedParams.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const clerkUser = await currentUser();
    if (!clerkUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await prisma.user.findUnique({ where: { clerkId: clerkUser.id } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const resolvedParams = await params;
    
    const event = await prisma.event.findUnique({ where: { id: resolvedParams.id } });
    if (!event) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (event.creatorId !== user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const body = await req.json();

    const updated = await prisma.event.update({
      where: { id: resolvedParams.id },
      data: {
        title: body.title,
        description: body.description,
        category: body.category,
        location: body.location,
        city: body.city,
        startDate: new Date(body.startDate),
        endDate: body.endDate ? new Date(body.endDate) : undefined,
        maxAttendees: body.maxAttendees ? body.maxAttendees : null,
        isFree: body.isFree,
        fee: body.fee ? body.fee : null,
      }
    });

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
