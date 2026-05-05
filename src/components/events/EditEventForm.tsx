"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function EditEventForm({ event }: { event: any }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const toLocalISO = (dateStr: string | null | undefined) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const offset = date.getTimezoneOffset() * 60000;
    return (new Date(date.getTime() - offset)).toISOString().slice(0, 16);
  };

  const [form, setForm] = useState({
    title: event.title || "",
    description: event.description || "",
    category: event.category || "MEETUP",
    location: event.location || "",
    city: event.city || "Dhaka",
    startDate: toLocalISO(event.startDate),
    endDate: toLocalISO(event.endDate),
    maxAttendees: event.maxAttendees?.toString() || "",
    isFree: event.isFree,
    fee: event.fee?.toString() || "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (form.endDate && new Date(form.startDate) >= new Date(form.endDate)) {
      alert("End date and time must be after the start date and time.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/events/${event.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          maxAttendees: form.maxAttendees ? parseInt(form.maxAttendees) : undefined,
          fee: form.fee ? parseFloat(form.fee) : undefined,
        }),
      });
      if (res.ok) router.push("/events");
      else alert("Failed to update event");
    } catch(err) {
      alert("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full bg-[#FAF7F2] border border-black/[0.08] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#4A7C28] transition-colors";

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/events" className="w-9 h-9 rounded-xl bg-white border border-black/[0.08] flex items-center justify-center hover:bg-[#FAF7F2] transition-colors">
          <ArrowLeft className="w-4 h-4 text-gray-500" />
        </Link>
        <div>
          <h1 className="font-display text-2xl font-bold">Update Event</h1>
          <p className="text-sm text-gray-400">Modify your community pet event</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-black/[0.06] p-8 space-y-5">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1.5">Event Title *</label>
          <input required value={form.title} onChange={e => setForm(f => ({...f, title: e.target.value}))}
            placeholder="e.g. Pug Meetup at Ramna Park" className={inputClass} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Category</label>
            <select value={form.category} onChange={e => setForm(f => ({...f, category: e.target.value}))} className={inputClass}>
              {["MEETUP","ADOPTION_FAIR","VACCINATION_CAMP","TRAINING_WORKSHOP","PET_SHOW","OTHER"].map(c => (
                <option key={c} value={c}>{c.replace(/_/g," ")}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">City</label>
            <input value={form.city} onChange={e => setForm(f => ({...f, city: e.target.value}))} className={inputClass} />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Date & Time *</label>
            <input required type="datetime-local" value={form.startDate} onChange={e => setForm(f => ({...f, startDate: e.target.value}))} className={inputClass} />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">End Time</label>
            <input type="datetime-local" value={form.endDate} onChange={e => setForm(f => ({...f, endDate: e.target.value}))} className={inputClass} />
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1.5">Location *</label>
          <input required value={form.location} onChange={e => setForm(f => ({...f, location: e.target.value}))}
            placeholder="e.g. Ramna Park, Gate 3" className={inputClass} />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1.5">Description</label>
          <textarea value={form.description} onChange={e => setForm(f => ({...f, description: e.target.value}))}
            rows={3} placeholder="Tell people what to expect..."
            className={inputClass + " resize-none"} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Max Attendees</label>
            <input type="number" value={form.maxAttendees} onChange={e => setForm(f => ({...f, maxAttendees: e.target.value}))}
              placeholder="Leave blank for unlimited" className={inputClass} />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Entry Fee (৳)</label>
            <input type="number" step="0.01" disabled={form.isFree} value={form.fee} onChange={e => setForm(f => ({...f, fee: e.target.value}))}
              placeholder="0 for free" className={inputClass + " disabled:opacity-40"} />
          </div>
        </div>
        <label className="flex items-center gap-3 cursor-pointer">
          <input type="checkbox" checked={form.isFree} onChange={e => setForm(f => ({...f, isFree: e.target.checked, fee: ""}))}
            className="w-4 h-4 accent-[#2D5016]" />
          <span className="text-sm text-gray-600">This is a free event</span>
        </label>

        <button type="submit" disabled={loading}
          className="w-full bg-[#2D5016] text-white py-3.5 rounded-xl font-medium hover:bg-[#4A7C28] transition-all disabled:opacity-50">
          {loading ? "Updating..." : "Update Event"}
        </button>
      </form>
    </div>
  );
}
