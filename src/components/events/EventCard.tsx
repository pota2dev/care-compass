"use client";

import Link from "next/link";
import { Calendar, MapPin, Users } from "lucide-react";
import { format } from "date-fns";

export default function EventCard({ event, userId, isJoined }: { event: any, userId: string, isJoined: boolean }) {
  return (
    <div className="bg-white border text-gray-800 rounded-2xl p-5 hover:border-[#2D5016] transition-colors relative">
      <div className="flex justify-between items-start mb-4">
        <div>
          <span className="inline-block px-2.5 py-1 bg-purple-50 text-purple-700 text-xs font-medium rounded-md mb-2">
            {event.category.replace(/_/g, " ")}
          </span>
          <h3 className="font-bold text-lg leading-tight">{event.title}</h3>
        </div>
        {event.imageUrl && (
          <img src={event.imageUrl} alt={event.title} className="w-16 h-16 rounded-xl object-cover" />
        )}
      </div>

      <div className="space-y-2 mb-6">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Calendar className="w-4 h-4" />
          <span>{format(new Date(event.startDate), "MMM d, yyyy • h:mm a")}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <MapPin className="w-4 h-4" />
          <span>{event.location}, {event.city}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Users className="w-4 h-4" />
          <span>{event._count.rsvps} attending</span>
        </div>
      </div>

      <div className="flex items-center justify-between border-t pt-4">
        <div className="text-sm font-medium">
          {event.isFree ? "Free" : `$${event.fee?.toFixed(2)}`}
        </div>
        <button
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
            isJoined
              ? "bg-gray-100 text-gray-600 cursor-default"
              : "bg-cream-100 text-[#2D5016] hover:bg-[#2D5016] hover:text-white"
          }`}
          disabled={isJoined}
        >
          {isJoined ? "Joined" : "Join Event"}
        </button>
      </div>
    </div>
  );
}
