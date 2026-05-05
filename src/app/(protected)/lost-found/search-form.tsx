"use client";

import { Search, Map as MapIcon, List } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { FormEvent } from "react";

export default function SearchForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const currentType = searchParams.get("type") || "";
  const currentCity = searchParams.get("city") || "";
  const currentSpecies = searchParams.get("species") || "";
  const currentView = searchParams.get("view") || "list";

  const isMapView = currentView === "map";

  // Auto-submit specific field changes seamlessly
  const handleAutoSubmit = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newType = e.target.value;
    const params = new URLSearchParams(searchParams.toString());
    if (newType) {
      params.set("type", newType);
    } else {
      params.delete("type");
    }
    router.push(`/lost-found?${params.toString()}`);
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const params = new URLSearchParams(searchParams.toString());
    
    const type = formData.get("type") as string;
    const city = formData.get("city") as string;
    const species = formData.get("species") as string;

    if (type) params.set("type", type);
    else params.delete("type");

    if (city) params.set("city", city);
    else params.delete("city");

    if (species) params.set("species", species);
    else params.delete("species");

    router.push(`/lost-found?${params.toString()}`);
  };

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-8 flex flex-wrap gap-4 items-center justify-between">
      <form onSubmit={handleSubmit} className="flex flex-wrap gap-4 flex-1">
        <div className="flex-1 min-w-[200px]">
          <select 
            name="type" 
            defaultValue={currentType}
            onChange={handleAutoSubmit}
            className="w-full h-10 px-3 rounded-md border border-gray-300 bg-white"
          >
            <option value="">All Types</option>
            <option value="LOST">Lost Pets</option>
            <option value="FOUND">Found/Rescued Pets</option>
          </select>
        </div>
        
        <div className="flex-1 min-w-[200px]">
          <input 
            name="city" 
            type="text" 
            placeholder="Filter by city..."
            defaultValue={currentCity}
            className="w-full h-10 px-3 rounded-md border border-gray-300"
          />
        </div>

        <div className="flex-1 min-w-[200px]">
          <input 
            name="species" 
            type="text" 
            placeholder="Species (e.g. Dog, Cat)"
            defaultValue={currentSpecies}
            className="w-full h-10 px-3 rounded-md border border-gray-300"
          />
        </div>

        <button 
          type="submit" 
          className="h-10 px-4 bg-gray-900 text-white rounded-md flex items-center gap-2 hover:bg-gray-800"
        >
          <Search className="w-4 h-4" />
          Search
        </button>
      </form>

      <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg">
        <Link 
          href={`/lost-found?${new URLSearchParams({ ...Object.fromEntries(searchParams.entries()), view: "list" }).toString()}`}
          className={`px-3 py-1.5 rounded-md flex items-center gap-2 text-sm font-medium transition-colors ${
            !isMapView ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-900"
          }`}
        >
          <List className="w-4 h-4" />
          List
        </Link>
        <Link 
          href={`/lost-found?${new URLSearchParams({ ...Object.fromEntries(searchParams.entries()), view: "map" }).toString()}`}
          className={`px-3 py-1.5 rounded-md flex items-center gap-2 text-sm font-medium transition-colors ${
            isMapView ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-900"
          }`}
        >
          <MapIcon className="w-4 h-4" />
          Map
        </Link>
      </div>
    </div>
  );
}
