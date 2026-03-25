"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, PawPrint, CalendarDays, ShoppingCart,
  CalendarCheck, Scissors, Home, Heart, Users, AlertTriangle,
  User, Bell, Settings, LogOut,
} from "lucide-react";
import { useClerk } from "@clerk/nextjs";

const NAV_ITEMS = [
  { label: "Main", items: [
    { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/pets", icon: PawPrint, label: "My Pets" },
    { href: "/bookings", icon: CalendarDays, label: "Bookings", badge: 3 },
    { href: "/shop/orders", icon: ShoppingCart, label: "Orders" },
  ]},
  { label: "Services", items: [
    { href: "/bookings/new?type=vet", icon: Home, label: "Vet Clinic" },
    { href: "/bookings/new?type=grooming", icon: Scissors, label: "Grooming" },
    { href: "/bookings/new?type=daycare", icon: Home, label: "Daycare" },
    { href: "/shop", icon: ShoppingCart, label: "Shop" },
  ]},
  { label: "Community", items: [
    { href: "/events", icon: CalendarCheck, label: "Events" },
    { href: "/adoption", icon: Heart, label: "Adoption" },
    { href: "/rescue", icon: AlertTriangle, label: "Rescue" },
  ]},
  { label: "Account", items: [
    { href: "/profile", icon: User, label: "Profile" },
    { href: "/notifications", icon: Bell, label: "Notifications", badge: 5 },
    { href: "/settings", icon: Settings, label: "Settings" },
  ]},
];

export default function Sidebar({ user }: { user?: any }) {
  const pathname = usePathname();
  const { signOut } = useClerk();

  return (
    <aside className="hidden lg:flex w-60 flex-col bg-white border-r border-forest-500/10 sticky top-0 h-screen">
      {/* Logo */}
      <div className="p-5 border-b border-forest-500/10">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-forest-500 rounded-lg flex items-center justify-center text-base">🐾</div>
          <span className="font-display font-bold text-lg text-forest-500">CareCompass</span>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-5">
        {NAV_ITEMS.map((section) => (
          <div key={section.label}>
            <p className="px-3 mb-1.5 text-[10px] font-medium text-forest-400/50 uppercase tracking-widest">{section.label}</p>
            {section.items.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link key={item.href} href={item.href}
                  className={cn(
                    "flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm transition-all mb-0.5",
                    isActive
                      ? "bg-forest-100 text-forest-500 font-medium"
                      : "text-forest-400/70 hover:bg-cream-100 hover:text-forest-500"
                  )}>
                  <item.icon className="w-4 h-4 flex-shrink-0" />
                  <span className="flex-1">{item.label}</span>
                  {item.badge && (
                    <span className="bg-clay text-white text-[10px] font-semibold px-1.5 py-0.5 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Sign out */}
      <div className="p-3 border-t border-forest-500/10">
        <button onClick={() => signOut({ redirectUrl: "/" })}
          className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-xl text-sm text-forest-400/70 hover:bg-clay-light hover:text-clay transition-all">
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
