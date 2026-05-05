"use server";

import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export async function submitReview(formData: FormData) {
  const { userId: clerkId } = await auth();
  if (!clerkId) throw new Error("Unauthorized");

  const dbUser = await db.user.findUnique({
    where: { clerkId: clerkId },
    select: { id: true }
  });

  if (!dbUser) throw new Error("User not found in database");

  const rating = Number(formData.get("rating"));
  const comment = formData.get("comment") as string;
  const idFromForm = formData.get("serviceId") as string;
  const serviceType = formData.get("serviceType") as string;

  await db.review.create({
    data: {
      rating,
      comment,
      serviceType: serviceType as any,
      user: {
        connect: { id: dbUser.id }
      },

      ...(serviceType === "PRODUCT" 
        ? { product: { connect: { id: idFromForm } } } 
        : { serviceProvider: { connect: { id: idFromForm } } }
      )
    },
  });


  const path = serviceType === "PRODUCT" ? `/shop/${idFromForm}` : `/services/${idFromForm}`;
  revalidatePath(path);
}