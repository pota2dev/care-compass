"use client";

import { useState } from "react";
import { addHealthRecord, uploadFileAction } from "@/actions/health-records";
import { useRouter } from "next/navigation";
import { FileUploadDropzone } from "@/components/shared/file-upload-dropzone";
import { Pet } from "@prisma/client";
import { Activity, Plus, Stethoscope, Syringe, FileText, Upload } from "lucide-react";

export function HealthRecordForm({ pet }: { pet: Pet }) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [documentUrl, setDocumentUrl] = useState<string | null>(null);
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [sendInstantReminder, setSendInstantReminder] = useState(false);

  const [formData, setFormData] = useState({
    type: "GENERAL",
    title: "",
    description: "",
    date: new Date().toISOString().split("T")[0],
    vetName: "",
    weight: pet.weight ? pet.weight.toString() : "",
    allergies: pet.allergies || "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      let finalDocumentUrl = documentUrl;
      if (documentFile) {
        const fileFormData = new FormData();
        fileFormData.append("file", documentFile);
        const url = await uploadFileAction(fileFormData);
        if (url) finalDocumentUrl = url;
      }

      const result = await addHealthRecord(pet.id, {
        type: formData.type,
        title: formData.title,
        description: formData.description,
        date: new Date(formData.date),
        vetName: formData.vetName,
        documentUrl: finalDocumentUrl || undefined,
        weight: formData.weight ? parseFloat(formData.weight) : undefined,
        allergies: formData.allergies,
        sendInstantReminder,
      });

      if (!result.success) {
        throw new Error(result.error);
      }

      setIsOpen(false);
      router.refresh();
      setFormData({
        type: "GENERAL",
        title: "",
        description: "",
        date: new Date().toISOString().split("T")[0],
        vetName: "",
        weight: pet.weight ? pet.weight.toString() : "",
        allergies: pet.allergies || "",
      });
      setDocumentUrl(null);
      setDocumentFile(null);
      setSendInstantReminder(false);
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="w-full flex items-center justify-center p-4 border-2 border-dashed border-forest-300 rounded-xl text-forest-700 hover:bg-forest-50 transition-colors"
      >
        <Plus className="w-5 h-5 mr-2" />
        Add New Medical Record / Vaccination
      </button>
    );
  }

  return (
    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm mb-8 relative">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold text-gray-900 border-l-4 border-forest-500 pl-3">
          Add Health Record
        </h3>
        <button
          onClick={() => setIsOpen(false)}
          className="text-gray-400 hover:text-gray-600"
        >
          Cancel
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Record Type
            </label>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
              {["GENERAL", "VACCINATION", "PRESCRIPTION", "VITAL"].map((t) => (
                <button
                  type="button"
                  key={t}
                  onClick={() => setFormData({ ...formData, type: t })}
                  className={`p-2 border rounded-lg text-sm flex flex-col items-center justify-center gap-1 transition-colors ${
                    formData.type === t
                      ? "border-forest-500 bg-forest-50 text-forest-700"
                      : "border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {t === "VACCINATION" && <Syringe className="w-4 h-4" />}
                  {t === "PRESCRIPTION" && <FileText className="w-4 h-4" />}
                  {t === "VITAL" && <Activity className="w-4 h-4" />}
                  {t === "GENERAL" && <Stethoscope className="w-4 h-4" />}
                  <span className="capitalize">{t.toLowerCase()}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title / Vaccine Name
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Rabies Vaccine, Annual Checkup"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-forest-500 focus:border-forest-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date
            </label>
            <input
              type="date"
              required
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-forest-500 focus:border-forest-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Vet / Clinic Name (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Happy Paws Vet Clinic"
              value={formData.vetName}
              onChange={(e) => setFormData({ ...formData, vetName: e.target.value })}
              className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-forest-500 focus:border-forest-500 outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description / Notes
          </label>
          <textarea
            required
            rows={3}
            placeholder="Details about the visit, symptoms, or vaccine batch..."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-forest-500 focus:border-forest-500 outline-none"
          />
        </div>

        <div className="border-t border-gray-100 pt-4 mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="text-sm font-medium text-forest-700 mb-3 flex items-center">
              <Activity className="w-4 h-4 mr-2" />
              Vital Stats (Updates Pet Profile)
            </h4>
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Weight (kg)</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="e.g. 5.5"
                  value={formData.weight}
                  onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                  className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-forest-500 focus:border-forest-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Allergies</label>
                <input
                  type="text"
                  placeholder="e.g. Chicken, Penicillin"
                  value={formData.allergies}
                  onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
                  className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-forest-500 focus:border-forest-500 outline-none"
                />
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-forest-700 mb-3 flex items-center">
              <Upload className="w-4 h-4 mr-2" />
              Upload Prescription / Document
            </h4>
            
            {documentUrl && !documentFile ? (
              <div className="bg-green-50 text-green-700 p-4 rounded-lg flex items-center justify-between border border-green-200">
                <div className="flex items-center">
                  <FileText className="w-5 h-5 mr-3" />
                  <span className="text-sm font-medium">Document uploaded successfully</span>
                </div>
                <button
                  type="button"
                  onClick={() => setDocumentUrl(null)}
                  className="text-sm underline text-green-600 hover:text-green-800"
                >
                  Remove
                </button>
              </div>
            ) : (
              <FileUploadDropzone 
                onFileChange={(file) => setDocumentFile(file)}
                initialFile={documentFile}
                subText="PDF, Images, or Documents allowed"
              />
            )}
          </div>
        </div>

        {formData.type === "VACCINATION" && (
          <div className="pt-2 flex items-center space-x-2">
            <input
              type="checkbox"
              id="instantReminder"
              checked={sendInstantReminder}
              onChange={(e) => setSendInstantReminder(e.target.checked)}
              className="w-4 h-4 text-forest-600 rounded focus:ring-forest-500 border-gray-300"
            />
            <label htmlFor="instantReminder" className="text-sm font-medium text-gray-700">
              [Test] Send reminder email now
            </label>
          </div>
        )}

        <div className="pt-4 flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 bg-forest-600 text-white rounded-lg font-medium hover:bg-forest-700 disabled:opacity-50 transition-colors shadow-sm focus:ring-2 focus:ring-forest-500 focus:outline-none"
          >
            {isSubmitting ? "Saving..." : "Save Record"}
          </button>
        </div>
      </form>
    </div>
  );
}
