import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const type   = searchParams.get("type");
  const search = searchParams.get("search");
  const city   = searchParams.get("city");

  const providers = await prisma.serviceProvider.findMany({
    where: {
      isActive: true,
      ...(type && type !== "ALL" ? { type: type as any } : {}),
      ...(city ? { city: { contains: city, mode: "insensitive" } } : {}),
      ...(search ? {
        OR: [
          { name:    { contains: search, mode: "insensitive" } },
          { address: { contains: search, mode: "insensitive" } },
          { city:    { contains: search, mode: "insensitive" } },
        ],
      } : {}),
    },
    select: {
      id:          true,
      name:        true,
      type:        true,
      description: true,
      address:     true,
      city:        true,
      phone:       true,
      email:       true,
      rating:      true,
      reviewCount: true,
      isVerified:  true,
      latitude:    true,
      longitude:   true,
    },
    orderBy: { rating: "desc" },
  });

  // For providers without coordinates, generate approximate
  // coordinates around Dhaka based on their index (demo purposes)
  // In production, you'd geocode addresses using Nominatim
  const DHAKA_CENTER = { lat: 23.8103, lng: 90.4125 };
  const withCoords = providers.map((p, i) => ({
    ...p,
    latitude:  p.latitude  ?? DHAKA_CENTER.lat + (Math.random() - 0.5) * 0.15,
    longitude: p.longitude ?? DHAKA_CENTER.lng + (Math.random() - 0.5) * 0.15,
  }));

  return NextResponse.json(withCoords);
}
