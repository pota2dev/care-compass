"use client";

import { Bell } from "lucide-react";
import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import dynamic from "next/dynamic";

const CartIcon = dynamic(() => import("@/components/shop/CartIcon"), {
  ssr: false,
  loading: () => <div className="w-9 h-9" />,
});

interface TopBarProps {
  user: { name: string; email: string; imageUrl: string };
}

export default function TopBar({ user }: TopBarProps) {
  return (
    <header
      className="h-16 bg-white border-b px-6 flex items-center justify-between sticky top-0 z-10"
      style={{ borderColor: "rgba(45,80,22,0.1)" }}
    >
      <div>
        <p className="text-sm font-medium" style={{ color: "#2D5016" }}>
          Welcome back,{" "}
          <span style={{ color: "#4A7C28" }}>{user.name.split(" ")[0]}</span> 👋
        </p>
      </div>
      <div className="flex items-center gap-2">
        <CartIcon />
        <Link
          href="/notifications"
          className="relative p-2 rounded-xl hover:bg-[#FAF7F2] transition-colors"
        >
          <Bell className="w-5 h-5" style={{ color: "#4A7C28" }} />
          <span
            className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full"
            style={{ backgroundColor: "#C8593A" }}
          />
        </Link>
        <UserButton
          afterSignOutUrl="/"
          appearance={{ elements: { avatarBox: "w-9 h-9" } }}
        />
      </div>
    </header>
  );
}