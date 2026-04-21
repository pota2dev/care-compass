import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const search = searchParams.get("search");

  const products = await prisma.product.findMany({
    where: {
      isActive: true,
      stock: { gt: 0 },
      ...(category ? { category: category as any } : {}),
      ...(search ? { name: { contains: search, mode: "insensitive" } } : {}),
    },
    include: { provider: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(products);
}
