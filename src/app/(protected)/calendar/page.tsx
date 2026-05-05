"use client";

import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { getHolidays, getAppEvents } from "@/actions/calendar";
import { CalendarDays, MapPin, Info, Users } from "lucide-react";

type CalendarEvent = {
  id: string;
  title: string;
  date: Date;
  type: 'holiday' | 'community';
  description?: string;
};

export default function CalendarPage() {
  const [date, setDate] = useState(new Date());
  const [allEvents, setAllEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [holidays, appEvents] = await Promise.all([
          getHolidays(),
          getAppEvents()
        ]);

        const formattedHolidays = holidays.map((h: any) => ({
          id: `holiday-${h.name}`,
          title: h.name,
          date: new Date(h.date.iso),
          type: 'holiday' as const,
          description: h.description
        }));

        const formattedAppEvents = appEvents.map((e: any) => ({
          id: e.id,
          title: e.title,
          date: new Date(e.startDate),
          type: 'community' as const,
          description: e.description || e.category
        }));

        setAllEvents([...formattedHolidays, ...formattedAppEvents]);
      } catch (error) {
        console.error("Error loading calendar:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const tileContent = ({ date: cellDate, view }: { date: Date, view: string }) => {
    if (view === 'month') {
      const dayEvents = allEvents.filter(
        (e) => e.date.toDateString() === cellDate.toDateString()
      );
      
      if (dayEvents.length > 0) {
        return (
          <div className="flex justify-center gap-1 mt-1">
            {dayEvents.map((e) => (
              <div 
                key={e.id} 
                className={`w-1.5 h-1.5 rounded-full ${e.type === 'holiday' ? 'bg-[#2D5016]' : 'bg-orange-500'}`} 
              />
            ))}
          </div>
        );
      }
    }
    return null;
  };

  const selectedDayEvents = allEvents.filter(
    (e) => e.date.toDateString() === date.toDateString()
  );

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-[#2D5016] flex items-center gap-2">
          <CalendarDays className="w-8 h-8" /> Event Calendar
        </h1>
        <p className="text-gray-500 mt-1 text-sm">National holidays and pet community events</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-6 rounded-[2rem] border border-black/[0.05] shadow-sm">
          <style>{`
            .react-calendar { width: 100%; border: none; font-family: inherit; }
            .react-calendar__tile { padding: 1.5em 0.5em; position: relative; }
            .react-calendar__tile--active { background: #2D5016 !important; border-radius: 16px; color: white !important; }
            .react-calendar__tile--now { background: #f3fceb; border-radius: 16px; color: #2D5016; font-weight: bold; }
            .react-calendar__navigation button { font-size: 1.1rem; font-weight: bold; color: #2D5016; }
            .react-calendar__tile:hover { background: #FAF7F2; border-radius: 16px; }
          `}</style>
          <Calendar 
            onChange={(d) => setDate(d as Date)} 
            value={date}
            tileContent={tileContent}
          />
        </div>

        <div className="space-y-4">
          <div className="bg-white p-6 rounded-[2rem] border border-black/[0.05] shadow-sm min-h-[400px]">
            <h3 className="font-bold mb-4 text-lg text-[#2D5016]">
              {date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </h3>
            
            {loading ? (
              <div className="space-y-4">
                {[1, 2].map((i) => <div key={i} className="h-20 bg-gray-50 rounded-2xl animate-pulse" />)}
              </div>
            ) : selectedDayEvents.length > 0 ? (
              <div className="space-y-3">
                {selectedDayEvents.map((e) => (
                  <div key={e.id} className={`p-4 rounded-2xl border ${e.type === 'holiday' ? 'bg-[#f9fbf7] border-[#2D5016]/10' : 'bg-orange-50 border-orange-100'}`}>
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${e.type === 'holiday' ? 'bg-[#2D5016] text-white' : 'bg-orange-500 text-white'}`}>
                        {e.type}
                      </span>
                    </div>
                    <p className="font-bold text-sm text-gray-900 leading-tight">{e.title}</p>
                    {e.description && <p className="text-xs text-gray-500 mt-2 line-clamp-3">{e.description}</p>}
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <span className="text-4xl mb-3 opacity-20">🐾</span>
                <p className="text-sm text-gray-400 italic">No events or holidays today</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}