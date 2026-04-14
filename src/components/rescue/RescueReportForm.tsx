"use client";

import { useState } from "react";
import { MapPin, AlertTriangle } from "lucide-react";

interface PinnedLocation {
  lat: number;
  lng: number;
  address: string;
}

interface Props {
  userId: string | null;
  pinnedLocation: PinnedLocation | null;
  onPinLocation: () => void;
  onSubmitted: (report: any) => void;
}

export default function RescueReportForm({
  userId,
  pinnedLocation,
  onPinLocation,
  onSubmitted,
}: Props) {
  const [form, setForm] = useState({
    animalType:  "Dog",
    condition:   "Injured — Needs Urgent Care",
    urgency:     "MEDIUM",
    city:        "Dhaka",
    description: "",
    manualLocation: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  function set(k: string, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
    setError("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!userId) {
      setError("You must be logged in to submit a rescue report.");
      return;
    }

    const location = pinnedLocation?.address || form.manualLocation;
    if (!location.trim()) {
      setError("Please pin a location on the map or enter an address manually.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/rescue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          animalType:  form.animalType,
          condition:   form.condition,
          urgency:     form.urgency,
          location,
          city:        form.city,
          description: form.description,
          latitude:    pinnedLocation?.lat ?? null,
          longitude:   pinnedLocation?.lng ?? null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Failed to submit. Please try again.");
        return;
      }

      const report = await res.json();
      onSubmitted(report);

      // Reset form
      setForm({
        animalType: "Dog", condition: "Injured — Needs Urgent Care",
        urgency: "MEDIUM", city: "Dhaka", description: "", manualLocation: "",
      });
    } catch {
      setError("Network error. Please check your connection.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white border rounded-2xl p-6 space-y-4"
      style={{ borderColor: "rgba(45,80,22,0.1)" }}>
      <h2 className="font-display text-lg font-semibold flex items-center gap-2">
        <AlertTriangle className="w-5 h-5" style={{ color: "#C8593A" }} />
        Report an Animal in Need
      </h2>

      {/* Animal + Urgency row */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium mb-1.5" style={{ color: "#4A7C28" }}>
            Animal Type
          </label>
          <select value={form.animalType} onChange={(e) => set("animalType", e.target.value)}
            className="w-full bg-[#FAF7F2] border rounded-xl px-3 py-2.5 text-sm outline-none"
            style={{ borderColor: "rgba(45,80,22,0.15)" }}>
            <option>Dog</option>
            <option>Cat</option>
            <option>Bird</option>
            <option>Rabbit</option>
            <option>Other</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium mb-1.5" style={{ color: "#4A7C28" }}>
            Urgency Level
          </label>
          <select value={form.urgency} onChange={(e) => set("urgency", e.target.value)}
            className="w-full bg-[#FAF7F2] border rounded-xl px-3 py-2.5 text-sm outline-none"
            style={{ borderColor: "rgba(45,80,22,0.15)" }}>
            <option value="LOW">🟢 Low</option>
            <option value="MEDIUM">🟡 Medium</option>
            <option value="HIGH">🟠 High</option>
            <option value="CRITICAL">🔴 Critical</option>
          </select>
        </div>
      </div>

      {/* Condition */}
      <div>
        <label className="block text-xs font-medium mb-1.5" style={{ color: "#4A7C28" }}>
          Condition
        </label>
        <select value={form.condition} onChange={(e) => set("condition", e.target.value)}
          className="w-full bg-[#FAF7F2] border rounded-xl px-3 py-2.5 text-sm outline-none"
          style={{ borderColor: "rgba(45,80,22,0.15)" }}>
          <option>Injured — Needs Urgent Care</option>
          <option>Stray — Seems Healthy</option>
          <option>Abandoned Pet</option>
          <option>Sick or Malnourished</option>
          <option>Trapped or Stuck</option>
          <option>Aggressive / Dangerous</option>
        </select>
      </div>

      {/* Location */}
      <div>
        <label className="block text-xs font-medium mb-1.5" style={{ color: "#4A7C28" }}>
          Location *
        </label>
        {pinnedLocation ? (
          <div className="flex items-center gap-2 p-3 rounded-xl border"
            style={{ backgroundColor: "#F2F7EC", borderColor: "#C8DFB0" }}>
            <MapPin className="w-4 h-4 flex-shrink-0" style={{ color: "#2D5016" }} />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium" style={{ color: "#2D5016" }}>📍 Location pinned on map</p>
              <p className="text-xs truncate mt-0.5" style={{ color: "#4A7C28" }}>{pinnedLocation.address}</p>
            </div>
            <button type="button" onClick={onPinLocation}
              className="text-xs flex-shrink-0 underline" style={{ color: "#4A7C28" }}>
              Change
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <button type="button" onClick={onPinLocation}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 border-dashed text-sm font-medium transition-all"
              style={{ borderColor: "#4A7C28", color: "#2D5016", backgroundColor: "#F2F7EC" }}>
              <MapPin className="w-4 h-4" />
              📍 Pin Location on Map
            </button>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-px" style={{ backgroundColor: "rgba(45,80,22,0.1)" }} />
              <span className="text-xs" style={{ color: "#8A9480" }}>or type address</span>
              <div className="flex-1 h-px" style={{ backgroundColor: "rgba(45,80,22,0.1)" }} />
            </div>
            <input
              value={form.manualLocation}
              onChange={(e) => set("manualLocation", e.target.value)}
              placeholder="e.g. Near Farmgate flyover, Dhaka"
              className="w-full bg-[#FAF7F2] border rounded-xl px-3 py-2.5 text-sm outline-none"
              style={{ borderColor: "rgba(45,80,22,0.15)" }}
            />
          </div>
        )}
      </div>

      {/* City */}
      <div>
        <label className="block text-xs font-medium mb-1.5" style={{ color: "#4A7C28" }}>City</label>
        <input value={form.city} onChange={(e) => set("city", e.target.value)}
          className="w-full bg-[#FAF7F2] border rounded-xl px-3 py-2.5 text-sm outline-none"
          style={{ borderColor: "rgba(45,80,22,0.15)" }} />
      </div>

      {/* Description */}
      <div>
        <label className="block text-xs font-medium mb-1.5" style={{ color: "#4A7C28" }}>
          Description
        </label>
        <textarea
          value={form.description}
          onChange={(e) => set("description", e.target.value)}
          rows={3}
          placeholder="Describe the animal's appearance, injuries, behaviour, and anything that will help rescuers find it quickly..."
          className="w-full bg-[#FAF7F2] border rounded-xl px-3 py-2.5 text-sm outline-none resize-none"
          style={{ borderColor: "rgba(45,80,22,0.15)" }}
        />
      </div>

      {error && (
        <div className="text-sm px-4 py-3 rounded-xl" style={{ backgroundColor: "#F9EDE8", color: "#C8593A" }}>
          {error}
        </div>
      )}

      <button type="submit" disabled={loading}
        className="w-full py-3 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-50"
        style={{ backgroundColor: loading ? "#4A7C28" : "#C8593A" }}>
        {loading ? "Submitting..." : "🚨 Submit Rescue Request"}
      </button>

      <p className="text-[10px] text-center" style={{ color: "#8A9480" }}>
        Rescue teams will be notified immediately upon submission
      </p>
    </form>
  );
}
