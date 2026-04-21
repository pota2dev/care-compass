"use client";

import Link from "next/link";
import { Calendar, MapPin, Users } from "lucide-react";
import { format } from "date-fns";

export default function EventCard({ event, userId, isJoined, isPast, isHost }: { event: any, userId: string, isJoined: boolean, isPast?: boolean, isHost?: boolean }) {
  // Simple delete action setup. Actual logic requires an API route.
  return (
    <div className={`bg-white border text-gray-800 rounded-2xl p-5 transition-colors relative ${isPast ? 'opacity-80 grayscale-[20%]' : 'hover:border-[#2D5016]'}`}>
      <div className="flex justify-between items-start mb-4">
        <div>
          <div className="flex gap-2 mb-2 flex-wrap">
            <span className="inline-block px-2.5 py-1 bg-purple-50 text-purple-700 text-xs font-medium rounded-md">
              {event.category.replace(/_/g, " ")}
            </span>
            {isPast && (
              <span className="inline-block px-2.5 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-md uppercase">
                Ended
              </span>
            )}
            {isHost && (
              <span className="inline-block px-2.5 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-md uppercase">
                Hosting
              </span>
            )}
          </div>
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
        <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500">
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
        {isHost ? (
          <div className="flex gap-2">
            <Link href={`/events/${event.id}/edit`} className="bg-amber-100 text-amber-700 hover:bg-amber-200 px-4 py-2 rounded-full text-sm font-medium transition-colors">
              Edit
            </Link>
            <EventDeleteButton eventId={event.id} />
          </div>
        ) : (
          <button
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              isJoined || isPast
                ? "bg-gray-100 text-gray-500 cursor-not-allowed"
                : "bg-cream-100 text-[#2D5016] hover:bg-[#2D5016] hover:text-white"
            }`}
            disabled={isJoined || isPast}
          >
            {isJoined ? "Joined" : isPast ? "Ended" : "Join Event"}
          </button>
        )}
      </div>
    </div>
  );
}

function EventDeleteButton({ eventId }: { eventId: string }) {
  // Client wrapper for deleting
  const handleDelete = async () => {
    if (!confirm("Delete this event?")) return;
    const res = await fetch(`/api/events/${eventId}`, { method: "DELETE" });
    if (res.ok) window.location.reload();
    else alert("Failed to delete event.");
  };

  return (
    <button onClick={handleDelete} className="bg-red-100 text-red-700 hover:bg-red-200 px-4 py-2 rounded-full text-sm font-medium transition-colors">
      Delete
    </button>
  );
}
