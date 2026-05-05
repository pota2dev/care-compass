"use client";

import dynamic from "next/dynamic";
import { LostFoundPet } from "@prisma/client";

const LeafletMap = dynamic(() => import("./leaflet-map"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center bg-gray-100 rounded-lg border border-dashed border-gray-300 h-96 w-full animate-pulse">
      <p className="text-gray-500 font-medium">Loading Map...</p>
    </div>
  ),
});

type MapViewProps = {
  pets: LostFoundPet[];
  className?: string;
};

export default function MapView({ pets, className }: MapViewProps) {
  return <LeafletMap pets={pets} className={className} />;
}
