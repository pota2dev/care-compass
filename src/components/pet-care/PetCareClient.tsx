"use client";

import { useState } from "react";
import { Sparkles, ChevronDown, ChevronUp, AlertTriangle } from "lucide-react";
import PetCareForm from "./PetCareForm";
import PetCareResult from "./PetCareResult";

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
}

export default function PetCareClient({ pets }: Props) {
  const [loading, setLoading]               = useState(false);
  const [result, setResult]                 = useState<any>(null);
  const [error, setError]                   = useState("");
  const [showForm, setShowForm]             = useState(true);

  async function handleGenerate(formData: any) {
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch("/api/pet-care", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Failed to generate recommendations. Please try again.");
        return;
      }

      setResult(data);
      setShowForm(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      setError("Network error. Please check your connection.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
            style={{ backgroundColor: "#C8DFB0" }}>🐾</div>
          <h1 className="font-display text-3xl font-bold text-gray-900">
            Pet Care Recommendations
          </h1>
        </div>
        <p className="text-sm ml-13" style={{ color: "#8A9480" }}>
          AI-powered personalized daily care routine for your pet
        </p>
      </div>

      {/* Intro banner */}
      {!result && (
        <div className="rounded-2xl p-5 mb-6 flex items-start gap-4"
          style={{ backgroundColor: "#2D5016" }}>
          <Sparkles className="w-6 h-6 text-white flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-white mb-1">
              Powered by Groq AI
            </p>
            <p className="text-sm" style={{ color: "rgba(255,255,255,0.75)" }}>
              Get a personalized feeding schedule, exercise plan, grooming routine,
              and health reminders tailored specifically to your pet's age, weight,
              breed, and activity level.
            </p>
          </div>
        </div>
      )}

      {/* Result banner */}
      {result && (
        <div className="rounded-2xl p-4 mb-5 flex items-center justify-between"
          style={{ backgroundColor: "#C8DFB0" }}>
          <div className="flex items-center gap-3">
            <span className="text-2xl">✅</span>
            <div>
              <p className="font-semibold text-sm" style={{ color: "#2D5016" }}>
                Care routine generated for {result.petName}!
              </p>
              <p className="text-xs" style={{ color: "#4A7C28" }}>
                Scroll down to see the full personalized plan
              </p>
            </div>
          </div>
          <button
            onClick={() => { setShowForm(!showForm); }}
            className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg"
            style={{ backgroundColor: "#2D5016", color: "#fff" }}
          >
            {showForm ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            {showForm ? "Hide Form" : "Edit Details"}
          </button>
        </div>
      )}

      {/* Form */}
      {showForm && (
        <PetCareForm
          pets={pets}
          loading={loading}
          onGenerate={handleGenerate}
          error={error}
        />
      )}

      {/* Results */}
      {result && <PetCareResult data={result.recommendations} petName={result.petName} />}
    </div>
  );
}
