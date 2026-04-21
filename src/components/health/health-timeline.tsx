"use client";

import { format } from "date-fns";
import { Syringe, Stethoscope, FileText, Activity, Trash2, CalendarHeart } from "lucide-react";
import { deleteHealthRecord } from "@/actions/health-records";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function HealthTimeline({ records, petId }: { records: any[]; petId: string }) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this record?")) return;
    setIsDeleting(id);
    await deleteHealthRecord(id, petId);
    setIsDeleting(null);
    router.refresh();
  };

  if (records.length === 0) {
    return (
      <div className="py-12 bg-white rounded-xl border border-gray-100 shadow-sm text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-forest-50 text-forest-500 rounded-full mb-4">
          <Activity className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-1">No health records yet</h3>
        <p className="text-gray-500 max-w-sm mx-auto">
          Start building a medical history for your pet by adding their first vaccination or checkup.
        </p>
      </div>
    );
  }

  const getIcon = (type: string) => {
    switch (type) {
      case "VACCINATION": return <Syringe className="w-5 h-5" />;
      case "PRESCRIPTION": return <FileText className="w-5 h-5" />;
      case "VITAL": return <Activity className="w-5 h-5" />;
      default: return <Stethoscope className="w-5 h-5" />;
    }
  };

  const getColor = (type: string) => {
    switch (type) {
      case "VACCINATION": return "bg-blue-100 text-blue-600 border-blue-200";
      case "PRESCRIPTION": return "bg-purple-100 text-purple-600 border-purple-200";
      case "VITAL": return "bg-green-100 text-green-600 border-green-200";
      default: return "bg-forest-100 text-forest-600 border-forest-200";
    }
  };

  // Sort logic (if not already sorted by DB)
  // Usually sorted desc by date, so the first is the newest past event.
  // But vaccinations might have nextDueDate in the future!

  const upcomingVaccines = records.filter(r => r.nextDueDate && new Date(r.nextDueDate) > new Date()).sort((a,b) => new Date(a.nextDueDate).getTime() - new Date(b.nextDueDate).getTime());

  return (
    <div className="space-y-8">
      {upcomingVaccines.length > 0 && (
        <div className="bg-amber-50 rounded-xl p-5 border border-amber-200">
          <h3 className="font-semibold text-amber-800 flex items-center mb-4">
            <CalendarHeart className="w-5 h-5 mr-2" />
            Upcoming Vaccinations
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {upcomingVaccines.map(vaccine => (
              <div key={`upcoming-${vaccine.id}`} className="bg-white p-3 rounded-lg border border-amber-100 shadow-sm flex items-start">
                <div className="bg-amber-100 p-2 rounded-full text-amber-600 mr-3">
                  <Syringe className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{vaccine.title || 'Vaccination Due'}</p>
                  <p className="text-sm font-semibold text-amber-600">
                    Due: {format(new Date(vaccine.nextDueDate), "MMM d, yyyy")}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Previous: {format(new Date(vaccine.date), "MMM d, yyyy")}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 overflow-hidden relative">
        <h3 className="text-xl font-semibold text-gray-900 mb-6 border-l-4 border-forest-500 pl-3">
          Timeline
        </h3>
        
        <div className="absolute left-10 top-20 bottom-10 w-0.5 bg-gray-100" />

        <div className="space-y-8 relative z-10">
          {records.map((record) => (
            <div key={record.id} className="flex relative items-start gap-4">
              <div className={`flex-shrink-0 w-10 h-10 rounded-full border-2 flex items-center justify-center ${getColor(record.type)} z-10 bg-white`}>
                {getIcon(record.type)}
              </div>
              
              <div className="flex-1 bg-gray-50 p-4 rounded-xl border border-gray-100 shadow-sm relative group hover:bg-white hover:border-gray-200 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-semibold text-gray-900 text-lg">{record.title || record.type}</h4>
                    <p className="text-sm text-forest-600 font-medium">
                      {format(new Date(record.date), "MMMM d, yyyy")}
                      {record.vetName && ` • at ${record.vetName}`}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDelete(record.id)}
                    disabled={isDeleting === record.id}
                    className="text-gray-400 hover:text-red-500 transition-colors p-1"
                    title="Delete record"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <p className="text-gray-700 text-sm mb-3">
                  {record.description}
                </p>

                {((record.weight || record.allergies || record.documentUrl || record.nextDueDate)) && (
                  <div className="flex flex-wrap gap-2 pt-3 border-t border-gray-200">
                    {record.weight && (
                      <span className="inline-flex items-center px-2 py-1 bg-white border border-gray-200 text-xs font-medium text-gray-600 rounded-md">
                        {record.weight} kg
                      </span>
                    )}
                    {record.allergies && (
                      <span className="inline-flex items-center px-2 py-1 bg-red-50 border border-red-100 text-xs font-medium text-red-600 rounded-md">
                        Allergies: {record.allergies}
                      </span>
                    )}
                    {record.nextDueDate && (
                      <span className="inline-flex items-center px-2 py-1 bg-amber-50 border border-amber-100 text-xs font-medium text-amber-700 rounded-md">
                        Next Due: {format(new Date(record.nextDueDate), "MMM d, yyyy")}
                      </span>
                    )}
                    {record.documentUrl && (
                      <a
                        href={record.documentUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center px-2 py-1 bg-forest-50 hover:bg-forest-100 transition border border-forest-100 text-xs font-medium text-forest-700 rounded-md"
                      >
                        <FileText className="w-3 h-3 mr-1" />
                        View Document
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
