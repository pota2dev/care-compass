import { NextRequest, NextResponse } from "next/server";
import { Webhook } from "svix";
import { prisma } from "@/lib/prisma";

type ClerkEvent = {
  type: string;
  data: {
    id: string;
    email_addresses: { email_address: string }[];
    first_name?: string;
    last_name?: string;
    image_url?: string;
    phone_numbers?: { phone_number: string }[];
  };
};

export async function POST(req: NextRequest) {
  const payload = await req.text();
  const headers = {
    "svix-id": req.headers.get("svix-id") ?? "",
    "svix-timestamp": req.headers.get("svix-timestamp") ?? "",
    "svix-signature": req.headers.get("svix-signature") ?? "",
  };

  const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET!);
  let event: ClerkEvent;
  try {
    event = wh.verify(payload, headers) as ClerkEvent;
  } catch {
    return NextResponse.json({ error: "Invalid webhook" }, { status: 400 });
  }

  const { id, email_addresses, first_name, last_name, image_url, phone_numbers } = event.data;
  const email = email_addresses[0]?.email_address;
  const name = [first_name, last_name].filter(Boolean).join(" ") || "User";
  const phone = phone_numbers?.[0]?.phone_number;

  switch (event.type) {
    case "user.created":
      await prisma.user.create({
        data: { clerkId: id, email, name, avatarUrl: image_url, phone },
      });
      break;

    case "user.updated":
      await prisma.user.updateMany({
        where: { clerkId: id },
        data: { name, avatarUrl: image_url, email, phone },
      });
      break;

    case "user.deleted":
      await prisma.user.deleteMany({ where: { clerkId: id } });
      break;
  }

  return NextResponse.json({ success: true });
}
