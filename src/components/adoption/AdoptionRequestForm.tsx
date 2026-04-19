"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdoptionRequestForm({ postId }: { postId: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const message = formData.get("message") as string;

    try {
      const res = await fetch(`/api/adoption/${postId}/request`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "Failed to submit request");
        setLoading(false);
        return;
      }
      
      router.refresh();
    } catch (error) {
      alert("Something went wrong");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1 text-gray-700">Message to Owner (Optional)</label>
        <textarea 
          name="message" 
          rows={4} 
          className="w-full border border-gray-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-[#2D5016] focus:border-transparent transition-all" 
          placeholder="Tell the owner why you'd be a great match for this pet..."
        ></textarea>
      </div>
      <button 
        type="submit" 
        disabled={loading} 
        className="w-full bg-[#2D5016] text-white py-3.5 rounded-full font-medium hover:bg-[#4A7C28] transition-colors shadow-sm disabled:opacity-70"
      >
        {loading ? "Submitting..." : "Send Adoption Request"}
      </button>
      <p className="text-xs text-gray-500 text-center mt-2">
        The owner will be notified of your request and can choose to approve or decline.
      </p>
    </form>
  );
}
