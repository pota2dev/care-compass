import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Bell, Calendar, Info, CheckCircle2, ChevronRight, Megaphone } from "lucide-react";

export const metadata = { title: "Notifications | CareCompass" };

const getIcon = (type: string) => {
  switch (type) {
    case "NEW_EVENT": 
      return <Calendar className="w-5 h-5 text-[#2D5016]" />;
    case "BOOKING_CONFIRMED": 
      return <CheckCircle2 className="w-5 h-5 text-green-500" />;
    case "ADOPTION_REQUEST": 
      return <Info className="w-5 h-5 text-blue-500" />;
    default: 
      return <Bell className="w-5 h-5 text-gray-400" />;
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
    <div className="max-w-4xl mx-auto space-y-6 p-4 md:p-8">
      <div>
        <h1 className="font-display text-3xl font-bold text-[#2D5016]">Notifications</h1>
        <p className="text-sm text-gray-400 mt-1">Stay updated with community events and pet activities</p>
      </div>

      <div className="bg-white rounded-[2rem] border border-black/[0.06] divide-y divide-black/[0.06] overflow-hidden shadow-sm">
        {notifications.length === 0 ? (
          <div className="p-20 text-center">
            <div className="w-20 h-20 bg-[#FAF7F2] rounded-full flex items-center justify-center mx-auto mb-4">
              <Bell className="w-10 h-10 text-gray-200" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">All caught up!</h3>
            <p className="text-gray-400 text-sm mt-1">No new notifications at the moment.</p>
          </div>
        ) : (
          notifications.map((notification) => (
            <Link 
              key={notification.id}
              href={notification.link || "#"}
              className={`flex items-start gap-4 p-6 hover:bg-[#FAF7F2] transition-all group ${
                !notification.isRead ? "bg-[#FAF7F2]/50" : ""
              }`}
            >
              <div className="mt-1 p-3 bg-white rounded-2xl border border-black/[0.03] shadow-sm group-hover:scale-110 transition-transform">
                {getIcon(notification.type)}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <h3 className={`font-bold text-gray-900 ${!notification.isRead ? "flex items-center gap-2" : ""}`}>
                      {notification.title}
                      {!notification.isRead && (
                        <span className="w-2 h-2 bg-orange-500 rounded-full" />
                      )}
                    </h3>
                  </div>
                  <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">
                    {new Date(notification.createdAt).toLocaleDateString()}
                  </span>
                </div>
                
                <p className="text-sm text-gray-500 mt-1 leading-relaxed line-clamp-2">
                  {notification.message}
                </p>

                <div className="flex items-center justify-between mt-3">
                  {notification.link ? (
                    <span className="text-xs text-[#2D5016] font-bold flex items-center gap-1 group-hover:gap-2 transition-all">
                      View Details <ChevronRight className="w-3 h-3" />
                    </span>
                  ) : <div />}
                  
                  <span className="text-[10px] text-gray-300">
                    {new Date(notification.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}