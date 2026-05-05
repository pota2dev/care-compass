"use client";

import { useState, useEffect } from "react";
import { Sparkles } from "lucide-react";

interface Pet {
  id: string;
  name: string;
  species: string;
  breed: string | null;
  gender: string;
  dateOfBirth: Date | null;
  weight: number | null;
}

interface Props {
  pets: Pet[];
  loading: boolean;
  error: string;
  onGenerate: (data: any) => void;
}

const PET_EMOJI: Record<string, string> = {
  Dog: "🐕", Cat: "🐈", Rabbit: "🐇", Bird: "🦜", Fish: "🐠", Other: "🐾",
};

function calculateAge(dateOfBirth: Date | null): { years: number; months: number } {
  if (!dateOfBirth) return { years: 0, months: 0 };
  const now = new Date();
  const dob = new Date(dateOfBirth);
  let years  = now.getFullYear() - dob.getFullYear();
  let months = now.getMonth()    - dob.getMonth();
  if (months < 0) { years--; months += 12; }
  return { years, months };
}

export default function PetCareForm({ pets, loading, error, onGenerate }: Props) {
  const [selectedPetId, setSelectedPetId] = useState<string>("");
  const [form, setForm] = useState({
    petName:       "",
    species:       "Dog",
    breed:         "",
    ageYears:      0,
    ageMonths:     0,
    weightKg:      0,
    gender:        "MALE",
    activityLevel: "MODERATE" as "LOW" | "MODERATE" | "HIGH",
    healthIssues:  "",
    dietaryNeeds:  "",
  });

  // Auto-fill from selected pet
  useEffect(() => {
    if (!selectedPetId) return;
    const pet = pets.find((p) => p.id === selectedPetId);
    if (!pet) return;
    const age = calculateAge(pet.dateOfBirth);
    setForm((f) => ({
      ...f,
      petName:   pet.name,
      species:   pet.species,
      breed:     pet.breed ?? "",
      ageYears:  age.years,
      ageMonths: age.months,
      weightKg:  pet.weight ?? 0,
      gender:    pet.gender,
    }));
  }, [selectedPetId, pets]);

  function set(k: string, v: any) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onGenerate(form);
  }

  const inputStyle = {
    backgroundColor: "#FAF7F2",
    borderColor: "rgba(45,80,22,0.15)",
  };
  const labelStyle = { color: "#4A7C28" };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">

      {/* Select existing pet */}
      {pets.length > 0 && (
        <div className="bg-white border rounded-2xl p-5"
          style={{ borderColor: "rgba(45,80,22,0.1)" }}>
          <h2 className="font-display text-base font-semibold mb-3">
            Quick Fill from My Pets
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {pets.map((pet) => (
              <button
                key={pet.id}
                type="button"
                onClick={() => setSelectedPetId(pet.id)}
                className="p-3 rounded-xl border-2 text-center transition-all"
                style={selectedPetId === pet.id
                  ? { borderColor: "#2D5016", backgroundColor: "#F2F7EC" }
                  : { borderColor: "rgba(45,80,22,0.1)", backgroundColor: "#FAF7F2" }}
              >
                <div className="text-2xl mb-1">{PET_EMOJI[pet.species] ?? "🐾"}</div>
                <div className="text-xs font-medium text-gray-900">{pet.name}</div>
                <div className="text-[10px]" style={{ color: "#8A9480" }}>{pet.species}</div>
              </button>
            ))}
            <button
              type="button"
              onClick={() => { setSelectedPetId(""); setForm(f => ({ ...f, petName: "", species: "Dog", breed: "", ageYears: 0, ageMonths: 0, weightKg: 0, gender: "MALE" })); }}
              className="p-3 rounded-xl border-2 border-dashed text-center transition-all"
              style={{ borderColor: "rgba(45,80,22,0.2)", backgroundColor: "#FAF7F2" }}
            >
              <div className="text-2xl mb-1">✏️</div>
              <div className="text-xs font-medium" style={{ color: "#4A7C28" }}>Manual</div>
              <div className="text-[10px]" style={{ color: "#8A9480" }}>Enter details</div>
            </button>
          </div>
        </div>
      )}

      {/* Basic Info */}
      <div className="bg-white border rounded-2xl p-5"
        style={{ borderColor: "rgba(45,80,22,0.1)" }}>
        <h2 className="font-display text-base font-semibold mb-4">Pet Details</h2>
        <div className="grid grid-cols-2 gap-4">

          <div>
            <label className="block text-xs font-medium mb-1.5" style={labelStyle}>
              Pet Name *
            </label>
            <input
              required
              value={form.petName}
              onChange={(e) => set("petName", e.target.value)}
              placeholder="e.g. Bruno"
              className="w-full border rounded-xl px-3 py-2.5 text-sm outline-none"
              style={inputStyle}
            />
          </div>

          <div>
            <label className="block text-xs font-medium mb-1.5" style={labelStyle}>
              Species *
            </label>
            <select
              value={form.species}
              onChange={(e) => set("species", e.target.value)}
              className="w-full border rounded-xl px-3 py-2.5 text-sm outline-none"
              style={inputStyle}
            >
              <option>Dog</option>
              <option>Cat</option>
              <option>Rabbit</option>
              <option>Bird</option>
              <option>Fish</option>
              <option>Other</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium mb-1.5" style={labelStyle}>
              Breed
            </label>
            <input
              value={form.breed}
              onChange={(e) => set("breed", e.target.value)}
              placeholder="e.g. Labrador Retriever"
              className="w-full border rounded-xl px-3 py-2.5 text-sm outline-none"
              style={inputStyle}
            />
          </div>

          <div>
            <label className="block text-xs font-medium mb-1.5" style={labelStyle}>
              Gender
            </label>
            <select
              value={form.gender}
              onChange={(e) => set("gender", e.target.value)}
              className="w-full border rounded-xl px-3 py-2.5 text-sm outline-none"
              style={inputStyle}
            >
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
            </select>
          </div>

          {/* Age */}
          <div>
            <label className="block text-xs font-medium mb-1.5" style={labelStyle}>
              Age — Years
            </label>
            <input
              type="number" min={0} max={30}
              value={form.ageYears}
              onChange={(e) => set("ageYears", parseInt(e.target.value) || 0)}
              className="w-full border rounded-xl px-3 py-2.5 text-sm outline-none"
              style={inputStyle}
            />
          </div>

          <div>
            <label className="block text-xs font-medium mb-1.5" style={labelStyle}>
              Age — Months
            </label>
            <input
              type="number" min={0} max={11}
              value={form.ageMonths}
              onChange={(e) => set("ageMonths", parseInt(e.target.value) || 0)}
              className="w-full border rounded-xl px-3 py-2.5 text-sm outline-none"
              style={inputStyle}
            />
          </div>

          <div>
            <label className="block text-xs font-medium mb-1.5" style={labelStyle}>
              Weight (kg) *
            </label>
            <input
              type="number" min={0} step={0.1}
              value={form.weightKg || ""}
              onChange={(e) => set("weightKg", parseFloat(e.target.value) || 0)}
              placeholder="e.g. 12.5"
              className="w-full border rounded-xl px-3 py-2.5 text-sm outline-none"
              style={inputStyle}
            />
          </div>

          <div>
            <label className="block text-xs font-medium mb-1.5" style={labelStyle}>
              Activity Level *
            </label>
            <select
              value={form.activityLevel}
              onChange={(e) => set("activityLevel", e.target.value)}
              className="w-full border rounded-xl px-3 py-2.5 text-sm outline-none"
              style={inputStyle}
            >
              <option value="LOW">🐢 Low — Mostly rests</option>
              <option value="MODERATE">🐕 Moderate — Regular walks</option>
              <option value="HIGH">⚡ High — Very active</option>
            </select>
          </div>

        </div>
      </div>

      {/* Health & Diet */}
      <div className="bg-white border rounded-2xl p-5"
        style={{ borderColor: "rgba(45,80,22,0.1)" }}>
        <h2 className="font-display text-base font-semibold mb-4">
          Health & Diet <span className="text-xs font-normal" style={{ color: "#8A9480" }}>(optional)</span>
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium mb-1.5" style={labelStyle}>
              Health Issues or Conditions
            </label>
            <textarea
              value={form.healthIssues}
              onChange={(e) => set("healthIssues", e.target.value)}
              rows={2}
              placeholder="e.g. Allergies, arthritis, diabetes, hip dysplasia..."
              className="w-full border rounded-xl px-3 py-2.5 text-sm outline-none resize-none"
              style={inputStyle}
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1.5" style={labelStyle}>
              Dietary Preferences or Restrictions
            </label>
            <textarea
              value={form.dietaryNeeds}
              onChange={(e) => set("dietaryNeeds", e.target.value)}
              rows={2}
              placeholder="e.g. Grain-free, raw diet, sensitive stomach, vegetarian..."
              className="w-full border rounded-xl px-3 py-2.5 text-sm outline-none resize-none"
              style={inputStyle}
            />
          </div>
        </div>
      </div>

      {error && (
        <div className="px-4 py-3 rounded-xl text-sm flex items-center gap-2"
          style={{ backgroundColor: "#F9EDE8", color: "#C8593A" }}>
          <span>⚠️</span> {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading || !form.petName || !form.weightKg}
        className="w-full py-4 rounded-2xl text-base font-semibold text-white transition-all disabled:opacity-50 flex items-center justify-center gap-2"
        style={{ backgroundColor: "#2D5016" }}
      >
        {loading ? (
          <>
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Generating personalized plan...
          </>
        ) : (
          <>
            <Sparkles className="w-5 h-5" />
            Generate Care Routine for {form.petName || "My Pet"}
          </>
        )}
      </button>

      {loading && (
        <p className="text-center text-xs" style={{ color: "#8A9480" }}>
          This usually takes 5–10 seconds ✨
        </p>
      )}
    </form>
  );
}
