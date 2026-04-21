"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewAdoptionForm({ pets }: { pets: any[] }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const petId = formData.get("petId") as string;
    const type = formData.get("type") as string;
    const reason = formData.get("reason") as string;
    const description = formData.get("description") as string;

    try {
      const res = await fetch("/api/adoption", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ petId, type, reason, description }),
      });

      if (!res.ok) {
        const data = await res.json();
        const errorMessage = typeof data.error === 'object' ? JSON.stringify(data.error) : data.error;
        alert(errorMessage || "Failed to post");
        setLoading(false);
        return;
      }
      
      router.push("/adoption");
      router.refresh();
    } catch (error) {
      alert("Something went wrong");
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-2xl border border-black/[0.08] shadow-sm">
      <h2 className="text-2xl font-bold font-display mb-6">Post a Pet for Adoption</h2>
      {pets.length === 0 ? (
        <div className="text-center p-6 bg-amber-50 rounded-xl text-amber-700">
          <p>You don't have any eligible pets registered yet.</p>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Select Pet</label>
            <select name="petId" className="w-full border rounded-lg p-2" required>
              <option value="">Choose a pet...</option>
              {pets.map(pet => (
                <option key={pet.id} value={pet.id}>{pet.name} ({pet.species})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Adoption Type</label>
            <select name="type" className="w-full border rounded-lg p-2" required>
              <option value="PERMANENT">Permanent Adoption</option>
              <option value="TEMPORARY_FOSTER">Temporary Foster</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Reason</label>
            <textarea name="reason" className="w-full border rounded-lg p-2" rows={3} required minLength={10} placeholder="Why are you putting this pet up for adoption?"></textarea>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description (Optional)</label>
            <textarea name="description" className="w-full border rounded-lg p-2" rows={3} placeholder="Any more details about the foster/adoption requirements?"></textarea>
          </div>
          <button type="submit" disabled={loading} className="w-full bg-[#2D5016] text-white py-3 rounded-xl font-medium hover:bg-[#4A7C28] transition-colors">
            {loading ? "Posting..." : "Post for Adoption"}
          </button>
        </form>
      )}
    </div>
  );
}
