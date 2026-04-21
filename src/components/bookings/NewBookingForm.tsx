"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BookingType } from "@prisma/client";
import {
  CheckCircle,
  MapPin,
  Star,
  Clock,
  Home,
  Building2,
} from "lucide-react";

interface Pet {
  id: string;
  name: string;
  species: string;
}
interface Timeslot {
  id: string;
  startTime: string | Date;
  endTime: string | Date;
}
interface Provider {
  id: string;
  name: string;
  address: string;
  city: string;
  phone: string;
  rating: number;
  reviewCount: number;
  description: string | null;
  timeslots: Timeslot[];
}
interface Props {
  pets: Pet[];
  providers: Provider[];
  bookingType: BookingType;
  typeKey: string;
}

const PET_EMOJI: Record<string, string> = {
  Dog: "🐕",
  Cat: "🐈",
  Rabbit: "🐇",
  Bird: "🦜",
  Fish: "🐠",
  Other: "🐾",
};

export default function NewBookingForm({
  pets,
  providers,
  bookingType,
  typeKey,
}: Props) {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedPet, setSelectedPet] = useState("");
  const [selectedProvider, setSelectedProvider] = useState("");
  const [selectedTimeslot, setSelectedTimeslot] = useState("");
  const [notes, setNotes] = useState("");
  const [serviceMode, setServiceMode] = useState<"salon" | "home">("salon");
  const [homeAddress, setHomeAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const isGrooming = typeKey === "grooming";
  const provider = providers.find((p) => p.id === selectedProvider);
  const timeslot = provider?.timeslots.find((t) => t.id === selectedTimeslot);
  const pet = pets.find((p) => p.id === selectedPet);
  const isHomeService = isGrooming && serviceMode === "home";

  async function handleSubmit() {
    if (!selectedPet || !selectedProvider || !selectedTimeslot) {
      setError("Please complete all steps.");
      return;
    }
    if (isHomeService && !homeAddress.trim()) {
      setError("Please enter your home address for the home service.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          petId: selectedPet,
          providerId: selectedProvider,
          timeslotId: selectedTimeslot,
          type: bookingType,
          notes: isHomeService
            ? `HOME SERVICE — Address: ${homeAddress}${notes ? `. Notes: ${notes}` : ""}`
            : notes,
          isHomeService,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Booking failed. Please try again.");
        return;
      }
      setSuccess(true);
      setTimeout(() => router.push("/bookings"), 2000);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="bg-white border border-forest-500/10 rounded-2xl p-12 text-center">
        <CheckCircle className="w-14 h-14 text-forest-500 mx-auto mb-4" />
        <h2 className="font-display text-2xl font-bold text-gray-900 mb-2">
          Booking Confirmed!
        </h2>
        <p className="text-sm" style={{ color: "#4A7C28" }}>
          {isHomeService
            ? "A groomer will visit you at the scheduled time."
            : "See you at the clinic!"}
        </p>
        <p className="text-xs mt-2" style={{ color: "#8A9480" }}>
          Redirecting to your bookings...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Step indicators */}
      <div className="flex items-center gap-2 mb-6">
        {[
          ["1", "Select Pet"],
          ["2", "Choose Provider"],
          ["3", "Pick Time & Confirm"],
        ].map(([n, label], i) => (
          <div key={n} className="flex items-center gap-2">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-all ${
                step > i + 1
                  ? "bg-forest-500 text-white"
                  : step === i + 1
                    ? "bg-forest-500 text-white"
                    : "bg-gray-100 text-gray-400"
              }`}
            >
              {step > i + 1 ? "✓" : n}
            </div>
            <span
              className={`text-sm hidden sm:block ${step === i + 1 ? "font-medium" : "text-gray-400"}`}
              style={step === i + 1 ? { color: "#2D5016" } : {}}
            >
              {label}
            </span>
            {i < 2 && <div className="w-6 h-px bg-gray-200" />}
          </div>
        ))}
      </div>

      {/* ── STEP 1 — Select Pet ── */}
      {step === 1 && (
        <div className="bg-white border border-forest-500/10 rounded-2xl p-6">
          <h2 className="font-display text-lg font-semibold mb-4">
            Which pet is this for?
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-5">
            {pets.map((p) => (
              <button
                key={p.id}
                onClick={() => setSelectedPet(p.id)}
                className={`p-4 rounded-xl border-2 text-center transition-all ${
                  selectedPet === p.id
                    ? "border-forest-500 bg-forest-50"
                    : "border-forest-500/10 bg-cream-100 hover:border-forest-500/30"
                }`}
                style={
                  selectedPet === p.id
                    ? { borderColor: "#2D5016", backgroundColor: "#F2F7EC" }
                    : {}
                }
              >
                <div className="text-3xl mb-2">
                  {PET_EMOJI[p.species] ?? "🐾"}
                </div>
                <div className="text-sm font-medium text-gray-900">
                  {p.name}
                </div>
                <div className="text-xs" style={{ color: "#8A9480" }}>
                  {p.species}
                </div>
              </button>
            ))}
          </div>
          <button
            onClick={() => {
              if (selectedPet) setStep(2);
            }}
            disabled={!selectedPet}
            className="w-full py-3 rounded-xl text-sm font-medium text-white transition-all disabled:opacity-40"
            style={{ backgroundColor: "#2D5016" }}
          >
            Continue →
          </button>
        </div>
      )}

      {/* ── STEP 2 — Choose Provider ── */}
      {step === 2 && (
        <div className="bg-white border border-forest-500/10 rounded-2xl p-6">
          <h2 className="font-display text-lg font-semibold mb-4">
            Choose a provider
          </h2>

          {/* Home Service Toggle — grooming only */}
          {isGrooming && (
            <div className="mb-5 p-1 bg-cream-100 rounded-xl flex gap-1">
              <button
                onClick={() => setServiceMode("salon")}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  serviceMode === "salon"
                    ? "bg-white shadow-sm text-gray-900"
                    : "text-gray-500"
                }`}
              >
                <Building2 className="w-4 h-4" /> Visit Salon
              </button>
              <button
                onClick={() => setServiceMode("home")}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  serviceMode === "home"
                    ? "bg-white shadow-sm text-gray-900"
                    : "text-gray-500"
                }`}
              >
                <Home className="w-4 h-4" /> Home Service 🏠
              </button>
            </div>
          )}

          {/* Home address input */}
          {isGrooming && serviceMode === "home" && (
            <div
              className="mb-4 p-4 rounded-xl border border-dashed"
              style={{ borderColor: "#4A7C28", backgroundColor: "#F2F7EC" }}
            >
              <div className="flex items-center gap-2 mb-3">
                <Home className="w-4 h-4" style={{ color: "#2D5016" }} />
                <span
                  className="text-sm font-medium"
                  style={{ color: "#2D5016" }}
                >
                  Groomer will come to your home
                </span>
              </div>
              <label
                className="block text-xs font-medium mb-1.5"
                style={{ color: "#4A7C28" }}
              >
                Your Home Address *
              </label>
              <input
                value={homeAddress}
                onChange={(e) => setHomeAddress(e.target.value)}
                placeholder="e.g. House 12, Road 5, Dhanmondi, Dhaka"
                className="w-full bg-white border rounded-xl px-3 py-2.5 text-sm text-gray-900 outline-none"
                style={{ borderColor: "rgba(74,124,40,0.3)" }}
              />
              <p className="text-xs mt-2" style={{ color: "#8A9480" }}>
                Additional travel fee may apply depending on your location.
              </p>
            </div>
          )}

          <div className="space-y-3">
            {providers.map((p) => (
              <button
                key={p.id}
                onClick={() => setSelectedProvider(p.id)}
                className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                  selectedProvider === p.id
                    ? "bg-forest-50"
                    : "hover:border-forest-500/30 bg-white"
                }`}
                style={
                  selectedProvider === p.id
                    ? { borderColor: "#2D5016", backgroundColor: "#F2F7EC" }
                    : { borderColor: "rgba(45,80,22,0.1)" }
                }
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900">{p.name}</div>
                    {p.description && (
                      <p
                        className="text-xs mt-0.5 line-clamp-1"
                        style={{ color: "#8A9480" }}
                      >
                        {p.description}
                      </p>
                    )}
                    <div className="flex items-center gap-3 mt-1.5">
                      <span
                        className="flex items-center gap-1 text-xs"
                        style={{ color: "#8A9480" }}
                      >
                        <MapPin className="w-3 h-3" />
                        {p.address}, {p.city}
                      </span>
                      <span
                        className="flex items-center gap-1 text-xs"
                        style={{ color: "#8A9480" }}
                      >
                        <Clock className="w-3 h-3" />
                        {p.timeslots.length} slots
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-xs flex-shrink-0">
                    <Star
                      className="w-3.5 h-3.5"
                      style={{ color: "#E8A030", fill: "#E8A030" }}
                    />
                    <span className="font-medium">{p.rating.toFixed(1)}</span>
                    <span style={{ color: "#8A9480" }}>({p.reviewCount})</span>
                  </div>
                </div>
                {p.timeslots.length === 0 && (
                  <div
                    className="mt-2 text-xs px-2 py-1 rounded-lg inline-block"
                    style={{ backgroundColor: "#F9EDE8", color: "#C8593A" }}
                  >
                    No timeslots — run the seed
                  </div>
                )}
              </button>
            ))}
          </div>

          <div className="flex gap-3 mt-5">
            <button
              onClick={() => setStep(1)}
              className="flex-1 py-3 rounded-xl text-sm font-medium transition-all"
              style={{ backgroundColor: "#FAF7F2", color: "#2D5016" }}
            >
              ← Back
            </button>
            <button
              onClick={() => {
                if (selectedProvider && provider?.timeslots.length) setStep(3);
              }}
              disabled={!selectedProvider || !provider?.timeslots.length}
              className="flex-1 py-3 rounded-xl text-sm font-medium text-white transition-all disabled:opacity-40"
              style={{ backgroundColor: "#2D5016" }}
            >
              Continue →
            </button>
          </div>
        </div>
      )}

      {/* ── STEP 3 — Timeslot + Confirm ── */}
      {step === 3 && provider && (
        <div className="bg-white border border-forest-500/10 rounded-2xl p-6">
          <h2 className="font-display text-lg font-semibold mb-1">
            Pick a time
          </h2>
          <p className="text-sm mb-4" style={{ color: "#8A9480" }}>
            {provider.name}
            {isHomeService && (
              <span
                className="ml-2 px-2 py-0.5 rounded-full text-xs font-medium"
                style={{ backgroundColor: "#F2F7EC", color: "#2D5016" }}
              >
                🏠 Home Service
              </span>
            )}
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-5">
            {provider.timeslots.map((slot) => {
              const start = new Date(slot.startTime);
              return (
                <button
                  key={slot.id}
                  onClick={() => setSelectedTimeslot(slot.id)}
                  className={`p-3 rounded-xl border-2 text-center transition-all`}
                  style={
                    selectedTimeslot === slot.id
                      ? { borderColor: "#2D5016", backgroundColor: "#F2F7EC" }
                      : { borderColor: "rgba(45,80,22,0.1)" }
                  }
                >
                  <div className="text-sm font-medium text-gray-900">
                    {start.toLocaleDateString("en-BD", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                    })}
                  </div>
                  <div className="text-xs mt-0.5" style={{ color: "#8A9480" }}>
                    {start.toLocaleTimeString("en-BD", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Notes */}
          <div className="mb-4">
            <label
              className="block text-xs font-medium mb-1.5"
              style={{ color: "#4A7C28" }}
            >
              Notes (optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder={
                isHomeService
                  ? "Any special instructions for the groomer..."
                  : "Any special requests or health notes..."
              }
              className="w-full bg-cream-100 border rounded-xl px-3 py-2.5 text-sm text-gray-900 outline-none resize-none"
              style={{ borderColor: "rgba(45,80,22,0.15)" }}
            />
          </div>

          {/* Summary */}
          {selectedTimeslot && pet && timeslot && (
            <div
              className="rounded-xl p-4 mb-4 text-sm space-y-2"
              style={{ backgroundColor: "#F2F7EC" }}
            >
              <div className="font-medium mb-1" style={{ color: "#2D5016" }}>
                Booking Summary
              </div>
              {[
                ["Pet", pet.name],
                ["Provider", provider.name],
                [
                  "Date",
                  new Date(timeslot.startTime).toLocaleDateString("en-BD", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  }),
                ],
                [
                  "Time",
                  new Date(timeslot.startTime).toLocaleTimeString("en-BD", {
                    hour: "2-digit",
                    minute: "2-digit",
                  }),
                ],
                ...(isHomeService
                  ? [
                      ["Service Type", "🏠 Home Service"],
                      ["Address", homeAddress],
                    ]
                  : [["Service Type", "🏢 Visit Salon"]]),
              ].map(([label, val]) => (
                <div key={label} className="flex justify-between">
                  <span style={{ color: "#4A7C28" }}>{label}</span>
                  <span className="font-medium text-gray-900 text-right max-w-[60%]">
                    {val}
                  </span>
                </div>
              ))}
            </div>
          )}

          {error && (
            <div
              className="text-sm px-4 py-3 rounded-xl mb-4"
              style={{ backgroundColor: "#F9EDE8", color: "#C8593A" }}
            >
              {error}
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={() => setStep(2)}
              className="flex-1 py-3 rounded-xl text-sm font-medium"
              style={{ backgroundColor: "#FAF7F2", color: "#2D5016" }}
            >
              ← Back
            </button>
            <button
              onClick={handleSubmit}
              disabled={!selectedTimeslot || loading}
              className="flex-1 py-3 rounded-xl text-sm font-medium text-white transition-all disabled:opacity-40"
              style={{ backgroundColor: "#2D5016" }}
            >
              {loading ? "Confirming..." : "Confirm Booking ✓"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
