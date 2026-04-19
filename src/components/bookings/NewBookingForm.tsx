"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BookingType } from "@prisma/client";
import { formatDateTime } from "@/lib/utils";
import { CheckCircle, MapPin, Star, Clock } from "lucide-react";

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
  timeslots: Timeslot[];
}

interface Props {
  pets: Pet[];
  providers: Provider[];
  bookingType: BookingType;
  typeKey: string;
}

const PET_EMOJI: Record<string, string> = {
  Dog: "🐕", Cat: "🐈", Rabbit: "🐇", Bird: "🦜", Fish: "🐠", Other: "🐾",
};

export default function NewBookingForm({ pets, providers, bookingType, typeKey }: Props) {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedPet, setSelectedPet] = useState<string>("");
  const [selectedProvider, setSelectedProvider] = useState<string>("");
  const [selectedTimeslot, setSelectedTimeslot] = useState<string>("");
  const [notes, setNotes] = useState("");
  const [isHomeService, setIsHomeService] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const provider = providers.find((p) => p.id === selectedProvider);
  const timeslot = provider?.timeslots.find((t) => t.id === selectedTimeslot);
  const pet = pets.find((p) => p.id === selectedPet);

  async function handleSubmit() {
    if (!selectedPet || !selectedProvider || !selectedTimeslot) {
      setError("Please complete all steps.");
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
          notes,
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
        <h2 className="font-display text-2xl font-bold text-gray-900 mb-2">Booking Confirmed!</h2>
        <p className="text-sm text-forest-400/60">Redirecting to your bookings...</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">

      {/* Step indicators */}
      <div className="flex items-center gap-3 mb-6">
        {[["1", "Select Pet"], ["2", "Choose Provider"], ["3", "Pick Time"]].map(([n, label], i) => (
          <div key={n} className="flex items-center gap-2">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-all ${
              step > i + 1
                ? "bg-forest-500 text-white"
                : step === i + 1
                ? "bg-forest-500 text-white"
                : "bg-gray-100 text-gray-400"
            }`}>
              {step > i + 1 ? "✓" : n}
            </div>
            <span className={`text-sm hidden sm:block ${step === i + 1 ? "text-forest-500 font-medium" : "text-gray-400"}`}>
              {label}
            </span>
            {i < 2 && <div className="w-8 h-px bg-gray-200 ml-1" />}
          </div>
        ))}
      </div>

      {/* STEP 1 — Select Pet */}
      {step === 1 && (
        <div className="bg-white border border-forest-500/10 rounded-2xl p-6">
          <h2 className="font-display text-lg font-semibold mb-4">Which pet is this for?</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {pets.map((pet) => (
              <button
                key={pet.id}
                onClick={() => setSelectedPet(pet.id)}
                className={`p-4 rounded-xl border-2 text-center transition-all ${
                  selectedPet === pet.id
                    ? "border-forest-500 bg-forest-50"
                    : "border-forest-500/10 bg-cream-100 hover:border-forest-500/30"
                }`}
              >
                <div className="text-3xl mb-2">{PET_EMOJI[pet.species] ?? "🐾"}</div>
                <div className="text-sm font-medium text-gray-900">{pet.name}</div>
                <div className="text-xs text-forest-400/60">{pet.species}</div>
              </button>
            ))}
          </div>
          <button
            onClick={() => { if (selectedPet) setStep(2); }}
            disabled={!selectedPet}
            className="mt-5 w-full bg-forest-500 text-white py-3 rounded-xl text-sm font-medium hover:bg-forest-400 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Continue →
          </button>
        </div>
      )}

      {/* STEP 2 — Select Provider */}
      {step === 2 && (
        <div className="bg-white border border-forest-500/10 rounded-2xl p-6">
          <h2 className="font-display text-lg font-semibold mb-4">Choose a provider</h2>
          <div className="space-y-3">
            {providers.map((p) => (
              <button
                key={p.id}
                onClick={() => setSelectedProvider(p.id)}
                className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                  selectedProvider === p.id
                    ? "border-forest-500 bg-forest-50"
                    : "border-forest-500/10 hover:border-forest-500/30"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{p.name}</div>
                    <div className="flex items-center gap-1 mt-1 text-xs text-forest-400/60">
                      <MapPin className="w-3 h-3" />
                      {p.address}, {p.city}
                    </div>
                    <div className="flex items-center gap-1 mt-1 text-xs text-forest-400/60">
                      <Clock className="w-3 h-3" />
                      {p.timeslots.length} slot{p.timeslots.length !== 1 ? "s" : ""} available
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-xs ml-3 flex-shrink-0">
                    <Star className="w-3.5 h-3.5 text-amber fill-amber" />
                    <span className="font-medium">{p.rating.toFixed(1)}</span>
                    <span className="text-forest-400/50">({p.reviewCount})</span>
                  </div>
                </div>
                {p.timeslots.length === 0 && (
                  <div className="mt-2 text-xs text-clay bg-clay-light px-2 py-1 rounded-lg inline-block">
                    No timeslots available
                  </div>
                )}
              </button>
            ))}
          </div>

          {typeKey === "grooming" && (
            <div className="mt-4 flex items-center gap-3 p-3 bg-cream-100 rounded-xl">
              <input
                type="checkbox"
                id="homeService"
                checked={isHomeService}
                onChange={(e) => setIsHomeService(e.target.checked)}
                className="w-4 h-4 accent-forest-500"
              />
              <label htmlFor="homeService" className="text-sm text-forest-400/80 cursor-pointer">
                Request home service (groomer comes to you)
              </label>
            </div>
          )}

          <div className="flex gap-3 mt-5">
            <button onClick={() => setStep(1)} className="flex-1 bg-cream-100 text-forest-500 py-3 rounded-xl text-sm font-medium hover:bg-cream-200 transition-all">
              ← Back
            </button>
            <button
              onClick={() => { if (selectedProvider && provider?.timeslots.length) setStep(3); }}
              disabled={!selectedProvider || !provider?.timeslots.length}
              className="flex-1 bg-forest-500 text-white py-3 rounded-xl text-sm font-medium hover:bg-forest-400 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Continue →
            </button>
          </div>
        </div>
      )}

      {/* STEP 3 — Pick timeslot + confirm */}
      {step === 3 && provider && (
        <div className="bg-white border border-forest-500/10 rounded-2xl p-6">
          <h2 className="font-display text-lg font-semibold mb-1">Pick a time</h2>
          <p className="text-sm text-forest-400/60 mb-4">{provider.name}</p>

          <div className="grid grid-cols-2 gap-2 mb-5">
            {provider.timeslots.map((slot) => (
              <button
                key={slot.id}
                onClick={() => setSelectedTimeslot(slot.id)}
                className={`p-3 rounded-xl border-2 text-center transition-all ${
                  selectedTimeslot === slot.id
                    ? "border-forest-500 bg-forest-50"
                    : "border-forest-500/10 hover:border-forest-500/30"
                }`}
              >
                <div className="text-sm font-medium text-gray-900">
                  {new Date(slot.startTime).toLocaleDateString("en-BD", { month: "short", day: "numeric" })}
                </div>
                <div className="text-xs text-forest-400/70 mt-0.5">
                  {new Date(slot.startTime).toLocaleTimeString("en-BD", { hour: "2-digit", minute: "2-digit" })}
                  {" – "}
                  {new Date(slot.endTime).toLocaleTimeString("en-BD", { hour: "2-digit", minute: "2-digit" })}
                </div>
              </button>
            ))}
          </div>

          <div className="mb-4">
            <label className="block text-xs font-medium text-forest-400/70 mb-1.5">
              Notes (optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="Any special requests or information..."
              className="w-full bg-cream-100 border border-forest-500/15 rounded-xl px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-forest-500/40 resize-none"
            />
          </div>

          {/* Summary */}
          {selectedTimeslot && pet && timeslot && (
            <div className="bg-forest-50 rounded-xl p-4 mb-4 text-sm space-y-1.5">
              <div className="font-medium text-forest-500 mb-2">Booking Summary</div>
              <div className="flex justify-between text-forest-400/80">
                <span>Pet</span><span className="font-medium text-gray-900">{pet.name}</span>
              </div>
              <div className="flex justify-between text-forest-400/80">
                <span>Provider</span><span className="font-medium text-gray-900">{provider.name}</span>
              </div>
              <div className="flex justify-between text-forest-400/80">
                <span>Date & Time</span>
                <span className="font-medium text-gray-900">
                  {new Date(timeslot.startTime).toLocaleDateString("en-BD", { month: "short", day: "numeric", year: "numeric" })}
                  {" "}
                  {new Date(timeslot.startTime).toLocaleTimeString("en-BD", { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
              {isHomeService && (
                <div className="flex justify-between text-forest-400/80">
                  <span>Service Type</span><span className="font-medium text-gray-900">Home Service</span>
                </div>
              )}
            </div>
          )}

          {error && (
            <div className="bg-clay-light text-clay text-sm px-4 py-3 rounded-xl mb-4">
              {error}
            </div>
          )}

          <div className="flex gap-3">
            <button onClick={() => setStep(2)} className="flex-1 bg-cream-100 text-forest-500 py-3 rounded-xl text-sm font-medium hover:bg-cream-200 transition-all">
              ← Back
            </button>
            <button
              onClick={handleSubmit}
              disabled={!selectedTimeslot || loading}
              className="flex-1 bg-forest-500 text-white py-3 rounded-xl text-sm font-medium hover:bg-forest-400 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {loading ? "Confirming..." : "Confirm Booking ✓"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
