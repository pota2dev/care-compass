"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { LostFoundPet } from "@prisma/client";
import Image from "next/image";

// Custom colored leaflet markers instead of default to clearly show Lost vs Found
const customIconFound = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const customIconLost = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

type LeafletMapProps = {
  pets: LostFoundPet[];
  className?: string;
};

export default function LeafletMap({ pets, className }: LeafletMapProps) {
  const initialLongitude = pets.length > 0 && pets[0].longitude ? pets[0].longitude : -98.35;
  const initialLatitude = pets.length > 0 && pets[0].latitude ? pets[0].latitude : 39.50;

  return (
    <div className={`overflow-hidden rounded-lg shadow-sm border border-gray-200 z-0 ${className || "h-96"}`}>
      <MapContainer
        center={[initialLatitude, initialLongitude]}
        zoom={pets.length > 0 ? 10 : 3}
        scrollWheelZoom={true}
        style={{ width: "100%", height: "100%", zIndex: 0 }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {pets.map((pet) => (
          pet.longitude && pet.latitude ? (
            <Marker
              key={pet.id}
              position={[pet.latitude, pet.longitude]}
              icon={pet.type === 'LOST' ? customIconLost : customIconFound}
            >
              <Popup className="rounded-xl overflow-hidden min-w-[200px]">
                <div className="p-0">
                  {pet.imageUrl && (
                    <div className="relative w-full h-32 mb-2 rounded overflow-hidden">
                      <Image 
                        src={pet.imageUrl} 
                        alt={pet.petName || "Pet"} 
                        width={200}
                        height={128}
                        className="object-cover w-full h-full" 
                        unoptimized
                      />
                    </div>
                  )}
                  <h3 className="font-bold text-lg leading-tight mt-1">{pet.petName || `Unknown ${pet.species}`}</h3>
                  <p className="text-sm font-medium mb-1 capitalize text-gray-500">{pet.type.toLowerCase()}</p>
                  <p className="text-sm truncate">{pet.location}</p>
                  <a href={`/lost-found/${pet.id}`} className="inline-block mt-2 text-forest-600 hover:underline text-sm font-medium">
                    View Details &rarr;
                  </a>
                </div>
              </Popup>
            </Marker>
          ) : null
        ))}
      </MapContainer>
    </div>
  );
}
