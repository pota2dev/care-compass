"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { acceptAdoptionRequest, rejectAdoptionRequest } from "@/actions/adoption";

interface RequestTableProps {
  requests: any[];
  petId: string;
}

export function RequestTable({ requests, petId }: RequestTableProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleAccept = (requestId: string, applicantId: string) => {
    if (!petId) {
      console.error("CRITICAL ERROR: petId is undefined in RequestTable");
      alert("System Error: Pet ID is missing. Please refresh and try again.");
      return;
    }

    console.log("Action: Accept Adoption", { requestId, petId, applicantId });

    const message = "Are you sure? This will transfer pet ownership to the applicant and delete this adoption post permanently.";
    if (!confirm(message)) return;
    
    startTransition(async () => {
      try {
        const res = await acceptAdoptionRequest(requestId, petId, applicantId);
        
        if (res.success) {
          router.push("/adoption");
          router.refresh();
        } else {
          alert(`Error: ${res.error || "Action failed. Check server logs."}`);
        }
      } catch (err) {
        console.error("Client-side error during accept:", err);
        alert("An unexpected error occurred. Please check your connection.");
      }
    });
  };

  const handleReject = (requestId: string) => {
    if (!confirm("Reject this applicant?")) return;

    startTransition(async () => {
      try {
        const res = await rejectAdoptionRequest(requestId);
        if (res.success) {
          router.refresh();
        } else {
          alert("Failed to reject the request.");
        }
      } catch (err) {
        console.error("Client-side error during reject:", err);
      }
    });
  };

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200">
            <th className="px-6 py-4 font-semibold text-gray-700">Applicant</th>
            <th className="px-6 py-4 font-semibold text-gray-700">Message</th>
            <th className="px-6 py-4 font-semibold text-gray-700 text-center">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {requests.length === 0 ? (
            <tr>
              <td colSpan={3} className="px-6 py-10 text-center text-gray-500 italic">
                No pending requests for this pet.
              </td>
            </tr>
          ) : (
            requests.map((request) => (
              <tr key={request.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-700 font-bold shrink-0">
                      {request.user.name?.charAt(0) || "U"}
                    </div>
                    <div className="min-w-0">
                      <div className="font-medium text-gray-900 truncate">{request.user.name}</div>
                      <div className="text-xs text-gray-500 truncate">{request.user.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600 italic leading-relaxed">
                  {request.message ? `"${request.message}"` : "No message provided"}
                </td>
                <td className="px-6 py-4 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <button 
                      disabled={isPending}
                      onClick={() => handleAccept(request.id, request.userId)}
                      className="bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700 disabled:opacity-50 transition-all min-w-[80px]"
                    >
                      {isPending ? "..." : "Accept"}
                    </button>
                    <button 
                      disabled={isPending}
                      onClick={() => handleReject(request.id)}
                      className="border border-red-200 text-red-600 px-4 py-2 rounded-md text-sm font-medium hover:bg-red-50 disabled:opacity-50 transition-all min-w-[80px]"
                    >
                      Reject
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}