"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Check, Edit, Trash2, X } from "lucide-react";

export default function AdoptionOwnerControls({ postId, currentStatus }: { postId: string, currentStatus: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this adoption post?")) return;
    
    setLoading(true);
    try {
      const res = await fetch(`/api/adoption/${postId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const error = await res.json();
        alert(error.error || "Failed to delete");
        setLoading(false);
        return;
      }
      router.push("/adoption");
      router.refresh();
    } catch (err) {
      alert("Something went wrong");
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/adoption/${postId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) {
        const error = await res.json();
        alert(error.error || "Failed to update status");
        setLoading(false);
        return;
      }
      router.refresh();
      setLoading(false);
    } catch (err) {
      alert("Something went wrong");
      setLoading(false);
    }
  };

  return (
    <div className="mt-4 flex flex-col gap-3">
      <div className="flex items-center gap-2">
        {currentStatus !== "OPEN" && (
          <button
            onClick={() => handleStatusChange("OPEN")}
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 bg-green-100 text-green-700 py-2 rounded-xl font-medium hover:bg-green-200 transition-colors disabled:opacity-50"
          >
            <Check className="w-4 h-4" /> Mark as Open
          </button>
        )}
        {currentStatus !== "CLOSED" && currentStatus !== "ADOPTED" && (
          <button
            onClick={() => handleStatusChange("CLOSED")}
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 bg-gray-100 text-gray-700 py-2 rounded-xl font-medium hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            <X className="w-4 h-4" /> Close Post
          </button>
        )}
        {currentStatus !== "ADOPTED" && (
          <button
            onClick={() => handleStatusChange("ADOPTED")}
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 bg-blue-100 text-blue-700 py-2 rounded-xl font-medium hover:bg-blue-200 transition-colors disabled:opacity-50"
          >
            <Check className="w-4 h-4" /> Mark Adopted
          </button>
        )}
      </div>

      <div className="flex items-center gap-2 border-t pt-3 border-black/[0.04]">
        <Link
          href={`/adoption/${postId}/edit`}
          className="flex-1 flex items-center justify-center gap-2 bg-amber-100 text-amber-700 py-2.5 rounded-xl font-medium hover:bg-amber-200 transition-colors"
        >
          <Edit className="w-4 h-4" /> Edit
        </Link>
        <button
          onClick={handleDelete}
          disabled={loading}
          className="flex-1 flex items-center justify-center gap-2 bg-red-100 text-red-700 py-2.5 rounded-xl font-medium hover:bg-red-200 transition-colors disabled:opacity-50"
        >
          <Trash2 className="w-4 h-4" /> Delete
        </button>
      </div>
    </div>
  );
}
