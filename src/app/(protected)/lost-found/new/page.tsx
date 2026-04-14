import { createLostFoundPost } from "@/actions/lost-found";
import { LostFoundType } from "@prisma/client";
import { redirect } from "next/navigation";
import { MapPin, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function NewLostFoundPage() {
  return (
    <div className="container mx-auto py-8 px-4 max-w-2xl">
      <Link href="/lost-found" className="text-gray-500 hover:text-gray-900 inline-flex items-center gap-2 mb-6 font-medium transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Back to Registry
      </Link>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Report Lost or Found Pet</h1>
          <p className="text-gray-500 mt-2">Fill in the details below. Providing an accurate location helps others find or identify the pet on the map.</p>
        </div>

        <form action={async (formData) => {
          "use server";
          const type = formData.get("type") as LostFoundType;
          const species = formData.get("species") as string;
          const petName = formData.get("petName") as string;
          const description = formData.get("description") as string;
          const location = formData.get("location") as string;
          const city = formData.get("city") as string;
          const lat = formData.get("latitude");
          const lng = formData.get("longitude");
          const imageUrl = formData.get("imageUrl") as string;
          const dateLostOrFound = formData.get("date") as string;

          const data = {
            type,
            species,
            petName: petName || undefined,
            description: description || undefined,
            location,
            city,
            latitude: lat ? parseFloat(lat as string) : undefined,
            longitude: lng ? parseFloat(lng as string) : undefined,
            imageUrl: imageUrl || undefined,
            dateLostOrFound: new Date(dateLostOrFound),
          };

          const post = await createLostFoundPost(data);
          redirect(`/lost-found/${post.id}`);
        }} className="space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-900">Report Type *</label>
              <select name="type" required className="w-full h-11 px-3 rounded-lg border border-gray-300 bg-white shadow-sm focus:ring-forest-500 focus:border-forest-500 outline-none transition-all">
                <option value="LOST">I Lost a Pet</option>
                <option value="FOUND">I Found a Pet</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-900">Species * (e.g. Dog, Cat, Bird)</label>
              <input type="text" name="species" required className="w-full h-11 px-3 rounded-lg border border-gray-300 shadow-sm focus:ring-forest-500 focus:border-forest-500 outline-none transition-all" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-900">Pet Name (If known)</label>
            <input type="text" name="petName" className="w-full h-11 px-3 rounded-lg border border-gray-300 shadow-sm focus:ring-forest-500 focus:border-forest-500 outline-none transition-all" />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-900">Description</label>
            <textarea name="description" rows={4} className="w-full p-3 rounded-lg border border-gray-300 shadow-sm focus:ring-forest-500 focus:border-forest-500 outline-none transition-all resize-y" placeholder="Colors, collar, markings, unusual behaviors..." />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-900">Image URL</label>
            <input type="url" name="imageUrl" className="w-full h-11 px-3 rounded-lg border border-gray-300 shadow-sm focus:ring-forest-500 focus:border-forest-500 outline-none transition-all" placeholder="https://..." />
            <p className="text-xs text-gray-500 mt-1">Provide a link to an image of the pet if available.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-900">Date Lost/Found *</label>
              <input type="date" name="date" required className="w-full h-11 px-3 rounded-lg border border-gray-300 bg-white shadow-sm focus:ring-forest-500 focus:border-forest-500 outline-none transition-all" />
            </div>
          </div>

          <div className="p-4 bg-gray-50 rounded-xl space-y-4 border border-gray-100">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-forest-600" />
              Location Details
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Specific Location *</label>
                <input type="text" name="location" required placeholder="E.g. Near Ramna Park" className="w-full h-10 px-3 rounded-md border border-gray-300 focus:ring-forest-500 outline-none" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">City *</label>
                <input type="text" name="city" required placeholder="E.g. Dhaka" className="w-full h-10 px-3 rounded-md border border-gray-300 focus:ring-forest-500 outline-none" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-500">Latitude (Optional for MapMarker)</label>
                <input type="number" step="any" name="latitude" placeholder="e.g. 23.7380" className="w-full h-10 px-3 rounded-md border border-gray-300 bg-white focus:ring-forest-500 outline-none" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-500">Longitude (Optional for MapMarker)</label>
                <input type="number" step="any" name="longitude" placeholder="e.g. 90.3960" className="w-full h-10 px-3 rounded-md border border-gray-300 bg-white focus:ring-forest-500 outline-none" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">To appear on the map view, please provide Latitude and Longitude.</p>
          </div>

          <div className="pt-4">
            <button type="submit" className="w-full bg-forest-600 hover:bg-forest-700 text-white h-12 rounded-lg font-bold text-lg shadow-sm transition-colors flex items-center justify-center gap-2">
              Submit Report
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
