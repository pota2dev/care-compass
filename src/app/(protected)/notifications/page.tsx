import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Bell, Calendar, Info, CheckCircle2 } from "lucide-react";

export const metadata = { title: "Notifications | CareCompass" };

// Helper to pick icons based on notification type
const getIcon = (type: string) => {
  switch (type) {
    case "BOOKING_CONFIRMED": return <CheckCircle2 className="w-5 h-5 text-green-500" />;
    case "ADOPTION": return <Calendar className="w-5 h-5 text-blue-500" />;
    default: return <Bell className="w-5 h-5 text-gray-400" />;
  }
};

export default async function NotificationsPage() {
  const { userId: clerkId } = await auth();
  if (!clerkId) redirect("/sign-in");

  const user = await prisma.user.findUnique({ where: { clerkId } });
  if (!user) redirect("/sign-in");

  const notifications = await prisma.notification.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold">Notifications</h1>
        <p className="text-sm text-gray-400 mt-1">Stay updated with your pet's activities</p>
      </div>

      <div className="bg-white rounded-2xl border border-black/[0.06] divide-y divide-black/[0.06] overflow-hidden">
        {notifications.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-[#FAF7F2] rounded-full flex items-center justify-center mx-auto mb-4">
              <Bell className="w-8 h-8 text-gray-300" />
            </div>
            <h3 className="text-lg font-medium">All caught up!</h3>
            <p className="text-gray-400 text-sm">No new notifications at the moment.</p>
          </div>
        ) : (
          notifications.map((notification) => (
            <Link 
              key={notification.id}
              href={notification.link || "#"}
              className="flex items-start gap-4 p-5 hover:bg-[#FAF7F2] transition-colors group"
            >
              <div className="mt-1 p-2 bg-white rounded-xl border border-black/[0.03] shadow-sm">
                {getIcon(notification.type)}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-semibold text-gray-900">{notification.title}</h3>
                  <span className="text-[10px] text-gray-400 uppercase font-medium">
                    {new Date(notification.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mt-0.5 leading-relaxed">
                  {notification.message}
                </p>
                {notification.link && (
                  <span className="text-[11px] text-[#2D5016] font-medium mt-2 inline-block group-hover:underline">
                    View details →
                  </span>
                )}
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}