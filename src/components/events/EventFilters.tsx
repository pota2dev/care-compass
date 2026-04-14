"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { Calendar, MapPin, Search } from "lucide-react";

export default function EventFilters({ cities }: { cities: string[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(name, value);
      } else {
        params.delete(name);
      }
      return params.toString();
    },
    [searchParams]
  );

  const toggleQuery = (name: string, value: string) => {
    const current = searchParams.get(name);
    if (current === value) {
      router.push(`?${createQueryString(name, "")}`);
    } else {
      router.push(`?${createQueryString(name, value)}`);
    }
  };

  const handleSelect = (name: string, value: string) => {
    router.push(`?${createQueryString(name, value)}`);
  };

  const isShowPast = searchParams.get("past") === "true";
  const isGoing = searchParams.get("rsvped") === "true";
  const location = searchParams.get("location") || "";
  const dateFilter = searchParams.get("date") || "";

  return (
    <div className="bg-white p-4 rounded-2xl border border-black/[0.06] shadow-sm space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        {/* Location Dropdown */}
        <div className="relative inline-flex items-center">
          <MapPin className="w-4 h-4 absolute left-3 text-gray-500" />
          <select
            value={location}
            onChange={(e) => handleSelect("location", e.target.value)}
            className="pl-9 pr-8 py-2 bg-gray-100 hover:bg-gray-200 border-none rounded-xl text-sm font-medium appearance-none cursor-pointer focus:ring-2 focus:ring-[#2D5016] transition-colors"
          >
            <option value="">Any location</option>
            {cities.map((city) => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>
          <div className="absolute right-3 pointer-events-none">
            <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
        </div>

        {/* Date Dropdown */}
        <div className="relative inline-flex items-center">
          <Calendar className="w-4 h-4 absolute left-3 text-gray-500" />
          <select
            value={dateFilter}
            onChange={(e) => handleSelect("date", e.target.value)}
            className="pl-9 pr-8 py-2 bg-gray-100 hover:bg-gray-200 border-none rounded-xl text-sm font-medium appearance-none cursor-pointer focus:ring-2 focus:ring-[#2D5016] transition-colors"
          >
            <option value="">Any date</option>
            <option value="today">Today</option>
            <option value="upcoming">Upcoming</option>
            <option value="weekend">This Weekend</option>
          </select>
          <div className="absolute right-3 pointer-events-none">
            <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
        </div>

        {/* Going / Attended Filter Button */}
        <button
          onClick={() => toggleQuery("rsvped", "true")}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${isGoing ? "bg-[#2D5016] text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
        >
          Going / Attended
        </button>
      </div>

      <div className="flex items-center gap-2 pt-2 border-t border-black/[0.04]">
        <label className="flex items-center gap-2 cursor-pointer group">
          <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${isShowPast ? "bg-[#2D5016] border-[#2D5016]" : "bg-white border-gray-300 group-hover:border-[#2D5016]"}`}>
            {isShowPast && <Check className="w-3.5 h-3.5 text-white" />}
          </div>
          <input 
            type="checkbox" 
            className="sr-only" 
            checked={isShowPast} 
            onChange={(e) => handleSelect("past", e.target.checked ? "true" : "")} 
          />
          <span className="text-sm text-gray-600 select-none">Show past events</span>
        </label>
      </div>
    </div>
  );
}

function Check({ className }: { className?: string }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
  );
}
