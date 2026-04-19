"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function NewPetPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "", species: "dog", breed: "", gender: "MALE",
    dateOfBirth: "", weight: "", color: "", microchipId: "", notes: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/pets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, weight: form.weight ? parseFloat(form.weight) : undefined }),
      });
      if (res.ok) router.push("/pets");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/pets" className="w-9 h-9 rounded-xl bg-white border border-black/[0.08] flex items-center justify-center hover:bg-[#FAF7F2] transition-colors">
          <ArrowLeft className="w-4 h-4 text-gray-500" />
        </Link>
        <div>
          <h1 className="font-display text-2xl font-bold">Add New Pet</h1>
          <p className="text-sm text-gray-400">Register your pet to get started</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-black/[0.06] p-8 space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Pet Name *</label>
            <input required value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))}
              placeholder="e.g. Bruno"
              className="w-full bg-[#FAF7F2] border border-black/[0.08] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#4A7C28] transition-colors" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Species *</label>
            <select value={form.species} onChange={e => setForm(f => ({...f, species: e.target.value}))}
              className="w-full bg-[#FAF7F2] border border-black/[0.08] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#4A7C28] transition-colors">
              <option value="dog">Dog</option>
              <option value="cat">Cat</option>
              <option value="rabbit">Rabbit</option>
              <option value="bird">Bird</option>
              <option value="fish">Fish</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Gender *</label>
            <select value={form.gender} onChange={e => setForm(f => ({...f, gender: e.target.value}))}
              className="w-full bg-[#FAF7F2] border border-black/[0.08] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#4A7C28] transition-colors">
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Breed</label>
            <input value={form.breed} onChange={e => setForm(f => ({...f, breed: e.target.value}))}
              placeholder="e.g. Labrador"
              className="w-full bg-[#FAF7F2] border border-black/[0.08] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#4A7C28] transition-colors" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Date of Birth</label>
            <input type="date" value={form.dateOfBirth} onChange={e => setForm(f => ({...f, dateOfBirth: e.target.value}))}
              className="w-full bg-[#FAF7F2] border border-black/[0.08] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#4A7C28] transition-colors" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Weight (kg)</label>
            <input type="number" step="0.1" value={form.weight} onChange={e => setForm(f => ({...f, weight: e.target.value}))}
              placeholder="e.g. 12.5"
              className="w-full bg-[#FAF7F2] border border-black/[0.08] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#4A7C28] transition-colors" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Color</label>
            <input value={form.color} onChange={e => setForm(f => ({...f, color: e.target.value}))}
              placeholder="e.g. Golden"
              className="w-full bg-[#FAF7F2] border border-black/[0.08] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#4A7C28] transition-colors" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Microchip ID</label>
            <input value={form.microchipId} onChange={e => setForm(f => ({...f, microchipId: e.target.value}))}
              placeholder="Optional"
              className="w-full bg-[#FAF7F2] border border-black/[0.08] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#4A7C28] transition-colors" />
          </div>
          <div className="col-span-2">
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Notes</label>
            <textarea value={form.notes} onChange={e => setForm(f => ({...f, notes: e.target.value}))}
              rows={3} placeholder="Any special notes or conditions..."
              className="w-full bg-[#FAF7F2] border border-black/[0.08] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#4A7C28] transition-colors resize-none" />
          </div>
        </div>

        <button type="submit" disabled={loading}
          className="w-full bg-[#2D5016] text-white py-3.5 rounded-xl font-medium hover:bg-[#4A7C28] transition-all disabled:opacity-50 disabled:cursor-not-allowed">
          {loading ? "Saving..." : "Add Pet"}
        </button>
      </form>
    </div>
  );
}
