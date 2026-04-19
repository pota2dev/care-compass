import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const rescueSchema = z.object({
  animalType:  z.string().min(1),
  condition:   z.string().min(1),
  location:    z.string().min(1),
  city:        z.string().min(1),
  description: z.string().optional(),
  urgency:     z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).default("MEDIUM"),
  imageUrl:    z.string().url().optional(),
  latitude:    z.number().nullable().optional(),
  longitude:   z.number().nullable().optional(),
});

export async function GET() {
  const reports = await prisma.rescueReport.findMany({
    include: { reporter: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
    take: 30,
  });
  return NextResponse.json(reports);
}

export async function POST(req: NextRequest) {
  const { userId: clerkId } = await auth();
  if (!clerkId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { clerkId } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const body = await req.json();
  const parsed = rescueSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 });
  }

  const report = await prisma.rescueReport.create({
    data: {
      ...parsed.data,
      reporterId: user.id,
      latitude:   parsed.data.latitude  ?? null,
      longitude:  parsed.data.longitude ?? null,
    },
    include: { reporter: { select: { name: true } } },
  });

  return NextResponse.json(report, { status: 201 });
}
