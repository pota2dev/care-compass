"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUser, useClerk } from "@clerk/nextjs";
import {
  LayoutDashboard,
  PawPrint,
  CalendarDays,
  ShoppingCart,
  CalendarCheck,
  Scissors,
  Home,
  Heart,
  AlertTriangle,
  User,
  Bell,
  Settings,
  LogOut,
  Wallet,
  Search
} from "lucide-react";

const NAV_ITEMS = [
  {
    label: "Main",
    items: [
      { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
      { href: "/pets", icon: PawPrint, label: "My Pets" },
      { href: "/expenses", icon: Wallet, label: "Expenses" },
      { href: "/bookings", icon: CalendarDays, label: "Bookings", badge: 3 },
      { href: "/shop/orders", icon: ShoppingCart, label: "Orders" },
    ],
  },
  {
    label: "Services",
    items: [
      { href: "/bookings/new?type=vet", icon: Home, label: "Vet Clinic" },
      {
        href: "/bookings/new?type=grooming",
        icon: Scissors,
        label: "Grooming",
      },
      { href: "/bookings/new?type=daycare", icon: Home, label: "Daycare" },
      { href: "/shop", icon: ShoppingCart, label: "Shop" },
    ],
  },
  {
    label: "Community",
    items: [
      { href: "/events", icon: CalendarCheck, label: "Events" },
      { href: "/adoption", icon: Heart, label: "Adoption" },
      { href: "/rescue", icon: AlertTriangle, label: "Rescue" },
      { href: "/lost-found", icon: Search, label: "Lost & Found" }
    ],
  },
  {
    label: "Account",
    items: [
      { href: "/profile", icon: User, label: "Profile" },
      { href: "/notifications", icon: Bell, label: "Notifications", badge: 5 },
      { href: "/settings", icon: Settings, label: "Settings" },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user } = useUser();
  const { signOut } = useClerk();

  return (
    <aside
      className="hidden lg:flex w-60 flex-col bg-white border-r sticky top-0 h-screen"
      style={{ borderColor: "rgba(45,80,22,0.1)" }}
    >
      {/* Logo */}
      <div
        className="p-5 border-b"
        style={{ borderColor: "rgba(45,80,22,0.1)" }}
      >
        <Link href="/" className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-base"
            style={{ backgroundColor: "#2D5016" }}
          >
            🐾
          </div>
          <span
            className="font-display font-bold text-lg"
            style={{ color: "#2D5016" }}
          >
            CareCompass
          </span>
        </Link>
      </div>

      {/* User pill */}
      {user && (
        <div
          className="mx-3 mt-3 p-3 rounded-xl flex items-center gap-2.5"
          style={{ backgroundColor: "#FAF7F2" }}
        >
          <img
            src={user.imageUrl}
            alt={user.fullName ?? "User"}
            className="w-8 h-8 rounded-full object-cover flex-shrink-0"
          />
          <div className="min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {user.fullName}
            </p>
            <p className="text-[10px] truncate" style={{ color: "#8A9480" }}>
              {user.emailAddresses[0]?.emailAddress}
            </p>
          </div>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-5 mt-2">
        {NAV_ITEMS.map((section) => (
          <div key={section.label}>
            <p
              className="px-3 mb-1.5 text-[10px] font-medium uppercase tracking-widest"
              style={{ color: "rgba(45,80,22,0.4)" }}
            >
              {section.label}
            </p>
            {section.items.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== "/dashboard" &&
                  pathname.startsWith(item.href.split("?")[0]));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm transition-all mb-0.5"
                  style={
                    isActive
                      ? {
                          backgroundColor: "#C8DFB0",
                          color: "#2D5016",
                          fontWeight: 500,
                        }
                      : { color: "rgba(45,80,22,0.7)" }
                  }
                >
                  <item.icon className="w-4 h-4 flex-shrink-0" />
                  <span className="flex-1">{item.label}</span>
                  {item.badge && (
                    <span
                      className="text-white text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
                      style={{ backgroundColor: "#C8593A" }}
                    >
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
      <div
        className="p-3 border-t"
        style={{ borderColor: "rgba(45,80,22,0.1)" }}
      >
        <button
          onClick={() => signOut({ redirectUrl: "/" })}
          className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-xl text-sm transition-all"
          style={{ color: "rgba(45,80,22,0.7)" }}
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
