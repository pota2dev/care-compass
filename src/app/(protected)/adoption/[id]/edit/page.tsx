import { currentUser } from "@clerk/nextjs/server";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import EditAdoptionForm from "@/components/adoption/EditAdoptionForm";

export default async function EditAdoptionPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const clerkUser = await currentUser();
  if (!clerkUser) redirect("/sign-in");
  const user = await prisma.user.findUnique({ where: { clerkId: clerkUser.id } });
  if (!user) redirect("/sign-in");

  const post = await prisma.adoptionPost.findUnique({
    where: { id },
  });

  if (!post) {
    return notFound();
  }

  if (post.ownerId !== user.id) {
    redirect(`/adoption/${post.id}`);
  }

  return (
    <EditAdoptionForm 
      postId={post.id} 
      initialData={{
        type: post.type,
        reason: post.reason,
        description: post.description,
      }} 
    />
  );
}
