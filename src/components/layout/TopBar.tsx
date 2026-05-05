"use client";

import { Bell } from "lucide-react";
import { UserButton } from "@clerk/nextjs";
import Link from "next/link";

interface TopBarProps {
  user: { name: string; email: string; imageUrl: string };
  unreadCount?: number;
}

export default function TopBar({ user, unreadCount = 0 }: TopBarProps) {
  return (
    <header className="h-16 bg-white border-b border-forest-500/10 px-6 flex items-center justify-between sticky top-0 z-10">
      <div>
        <p className="text-sm font-medium text-forest-500">
          Welcome back, <span className="text-forest-400">{user.name.split(" ")[0]}</span> 👋
        </p>
      </div>

      <div className="flex items-center gap-3">
        {/* Bell icon now leads to /notifications */}
        <Link 
          href="/notifications" 
          className="relative p-2 rounded-xl hover:bg-cream-100 transition-colors group"
        >
          <Bell className="w-5 h-5 text-forest-400 group-hover:scale-110 transition-transform" />
          
          {/* Only show the red dot if there are unread notifications */}
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-clay rounded-full border border-white pulse"></span>
          )}
        </Link>

        <UserButton 
          afterSignOutUrl="/" 
          appearance={{ 
            elements: { 
              avatarBox: "w-9 h-9 border border-forest-500/10 shadow-sm" 
            } 
          }} 
        />
      </div>
    </header>
  );
}