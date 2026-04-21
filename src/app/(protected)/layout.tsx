import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Sidebar from "@/components/layout/Sidebar";
import TopBar from "@/components/layout/TopBar";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const clerkUser = await currentUser();
  if (!clerkUser) redirect("/sign-in");

  const email = clerkUser.emailAddresses[0]?.emailAddress ?? "";

  // Upsert handles the "find or create" logic atomically
  const dbUser = await prisma.user.upsert({
    where: { clerkId: clerkUser.id },
    update: {
      // Update these fields if they changed in Clerk
      name: clerkUser.fullName ?? "User",
      avatarUrl: clerkUser.imageUrl,
      email: email,
    },
    create: {
      clerkId: clerkUser.id,
      email: email,
      name: clerkUser.fullName ?? "User",
      avatarUrl: clerkUser.imageUrl,
    },
  });

  return (
    <div className="min-h-screen bg-[#FAF7F2] flex">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar
          user={{
            name: dbUser.name,
            email: dbUser.email,
            imageUrl: clerkUser.imageUrl,
          }}
        />
        <main className="flex-1 p-6 lg:p-8 animate-fade-in">{children}</main>
      </div>
    </div>
  );
}
