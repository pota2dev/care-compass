"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function EditAdoptionForm({ 
  postId, 
  initialData 
}: { 
  postId: string, 
  initialData: { type: string, reason: string, description: string | null } 
}) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const type = formData.get("type") as string;
    const reason = formData.get("reason") as string;
    const description = formData.get("description") as string;

    try {
      const res = await fetch(`/api/adoption/${postId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, reason, description }),
      });

      if (!res.ok) {
        const data = await res.json();
        const errorMessage = typeof data.error === 'object' ? JSON.stringify(data.error) : data.error;
        alert(errorMessage || "Failed to update");
        setLoading(false);
        return;
      }
      
      router.push(`/adoption/${postId}`);
      router.refresh();
    } catch (error) {
      alert("Something went wrong");
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-2xl border border-black/[0.08] shadow-sm mt-8">
      <h2 className="text-2xl font-bold font-display mb-6">Edit Adoption Post</h2>
      
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Adoption Type</label>
          <select name="type" className="w-full border rounded-lg p-2" required defaultValue={initialData.type}>
            <option value="PERMANENT">Permanent Adoption</option>
            <option value="TEMPORARY_FOSTER">Temporary Foster</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Reason</label>
          <textarea 
            name="reason" 
            className="w-full border rounded-lg p-2" 
            rows={3} 
            required 
            minLength={10} 
            defaultValue={initialData.reason}
            placeholder="Why are you putting this pet up for adoption?">
          </textarea>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Description (Optional)</label>
          <textarea 
            name="description" 
            className="w-full border rounded-lg p-2" 
            rows={3} 
            defaultValue={initialData.description || ""}
            placeholder="Any more details about the foster/adoption requirements?">
          </textarea>
        </div>
        <div className="flex gap-3 pt-2">
          <button 
            type="button" 
            onClick={() => router.back()} 
            className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            disabled={loading} 
            className="flex-[2] bg-[#2D5016] text-white py-3 rounded-xl font-medium hover:bg-[#4A7C28] transition-colors"
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
