"use client";

import { useEffect, useRef, useState } from "react";

interface PinnedLocation {
  lat: number;
  lng: number;
  address: string;
}

interface ExistingReport {
  id: string;
  lat: number;
  lng: number;
  animalType: string;
  urgency: string;
  status: string;
}

interface Props {
  pinnedLocation: PinnedLocation | null;
  onLocationPinned: (loc: PinnedLocation) => void;
  existingReports?: ExistingReport[];
}

const URGENCY_COLOR: Record<string, string> = {
  LOW:      "#4A7C28",
  MEDIUM:   "#C47A10",
  HIGH:     "#C8593A",
  CRITICAL: "#DC2626",
};

export default function RescueMap({ pinnedLocation, onLocationPinned, existingReports = [] }: Props) {
  const mapRef     = useRef<HTMLDivElement>(null);
  const leafletRef = useRef<any>(null);
  const markerRef  = useRef<any>(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState("");
  const [address, setAddress]   = useState("");
  const [geocoding, setGeocoding] = useState(false);

  useEffect(() => {
    if (!mapRef.current || leafletRef.current) return;

    // Dynamically load Leaflet CSS
    const link = document.createElement("link");
    link.rel  = "stylesheet";
    link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    document.head.appendChild(link);

    // Dynamically load Leaflet JS
    const script = document.createElement("script");
    script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    script.onload = () => {
      const L = (window as any).L;

      // Default center: Dhaka, Bangladesh
      const map = L.map(mapRef.current!, {
        center: [23.8103, 90.4125],
        zoom: 12,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      leafletRef.current = map;
      setLoading(false);

      // Custom red pin icon for user's pin
      const redIcon = L.divIcon({
        html: `<div style="
          width:32px;height:40px;position:relative;
        ">
          <div style="
            width:32px;height:32px;border-radius:50% 50% 50% 0;
            background:#C8593A;transform:rotate(-45deg);
            border:3px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,0.3);
          "></div>
          <div style="
            position:absolute;top:8px;left:8px;
            width:12px;height:12px;border-radius:50%;
            background:#fff;
          "></div>
        </div>`,
        className: "",
        iconSize:   [32, 40],
        iconAnchor: [16, 40],
        popupAnchor:[0, -40],
      });

      // Plot existing reports
      existingReports.forEach((r) => {
        const color = URGENCY_COLOR[r.urgency] ?? "#C47A10";
        const icon = L.divIcon({
          html: `<div style="
            width:28px;height:28px;border-radius:50%;
            background:${color};border:2px solid #fff;
            display:flex;align-items:center;justify-content:center;
            font-size:14px;box-shadow:0 2px 6px rgba(0,0,0,0.25);
            cursor:pointer;
          ">
            ${{ Dog:"🐕", Cat:"🐈", Bird:"🦜", Rabbit:"🐇", Other:"🐾" }[r.animalType] ?? "🐾"}
          </div>`,
          className: "",
          iconSize:   [28, 28],
          iconAnchor: [14, 14],
        });

        L.marker([r.lat, r.lng], { icon })
          .addTo(map)
          .bindPopup(`
            <div style="font-family:sans-serif;min-width:140px">
              <p style="font-weight:600;margin:0 0 4px">${r.animalType}</p>
              <p style="font-size:11px;color:#666;margin:0 0 4px">Urgency: ${r.urgency}</p>
              <p style="font-size:11px;margin:0;
                background:${color}22;color:${color};
                padding:2px 8px;border-radius:20px;display:inline-block">
                ${r.status.replace("_"," ")}
              </p>
            </div>
          `);
      });

      // Click to pin location
      map.on("click", async (e: any) => {
        const { lat, lng } = e.latlng;

        // Remove old marker
        if (markerRef.current) {
          markerRef.current.remove();
        }

        // Add new marker
        const m = L.marker([lat, lng], { icon: redIcon, draggable: true }).addTo(map);
        markerRef.current = m;

        // Reverse geocode using Nominatim
        setGeocoding(true);
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
            { headers: { "Accept-Language": "en" } }
          );
          const data = await res.json();
          const addr = data.display_name ?? `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
          setAddress(addr);
          onLocationPinned({ lat, lng, address: addr });
          m.bindPopup(`<div style="font-size:12px;max-width:200px">${addr}</div>`).openPopup();
        } catch {
          const addr = `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
          setAddress(addr);
          onLocationPinned({ lat, lng, address: addr });
        } finally {
          setGeocoding(false);
        }

        // Update on drag
        m.on("dragend", async () => {
          const pos = m.getLatLng();
          setGeocoding(true);
          try {
            const res = await fetch(
              `https://nominatim.openstreetmap.org/reverse?lat=${pos.lat}&lon=${pos.lng}&format=json`,
              { headers: { "Accept-Language": "en" } }
            );
            const data = await res.json();
            const addr = data.display_name ?? `${pos.lat.toFixed(5)}, ${pos.lng.toFixed(5)}`;
            setAddress(addr);
            onLocationPinned({ lat: pos.lat, lng: pos.lng, address: addr });
          } catch {
            const addr = `${pos.lat.toFixed(5)}, ${pos.lng.toFixed(5)}`;
            setAddress(addr);
            onLocationPinned({ lat: pos.lat, lng: pos.lng, address: addr });
          } finally {
            setGeocoding(false);
          }
        });
      });

      // Try to get user's location
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            map.setView([pos.coords.latitude, pos.coords.longitude], 14);
          },
          () => {} // silently fail
        );
      }
    };

    script.onerror = () => setError("Failed to load map. Please check your connection.");
    document.head.appendChild(script);

    return () => {
      if (leafletRef.current) {
        leafletRef.current.remove();
        leafletRef.current = null;
      }
    };
  }, []);

  return (
    <div className="relative">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center z-10"
          style={{ backgroundColor: "#FAF7F2" }}>
          <div className="text-center">
            <div className="text-3xl mb-3 animate-pulse">🗺️</div>
            <p className="text-sm" style={{ color: "#4A7C28" }}>Loading map...</p>
          </div>
        </div>
      )}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center z-10"
          style={{ backgroundColor: "#FAF7F2" }}>
          <p className="text-sm text-center px-4" style={{ color: "#C8593A" }}>{error}</p>
        </div>
      )}

      {/* Map container */}
      <div ref={mapRef} style={{ height: "480px", width: "100%" }} />

      {/* Address overlay */}
      {(geocoding || address) && (
        <div className="absolute bottom-4 left-4 right-4 z-[1000]">
          <div className="bg-white rounded-xl px-4 py-3 shadow-lg flex items-center gap-3"
            style={{ borderLeft: "4px solid #C8593A" }}>
            {geocoding ? (
              <>
                <div className="w-4 h-4 border-2 rounded-full animate-spin flex-shrink-0"
                  style={{ borderColor: "#C8593A", borderTopColor: "transparent" }} />
                <span className="text-sm" style={{ color: "#4A7C28" }}>Getting address...</span>
              </>
            ) : (
              <>
                <span className="text-lg flex-shrink-0">📍</span>
                <span className="text-xs line-clamp-2" style={{ color: "#2D5016" }}>{address}</span>
              </>
            )}
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="absolute top-3 right-3 z-[1000] bg-white rounded-xl p-3 shadow-md text-xs space-y-1.5">
        <p className="font-medium mb-2" style={{ color: "#2D5016" }}>Map Legend</p>
        {[
          { color: "#C8593A", label: "Your pin" },
          { color: "#4A7C28", label: "Low urgency" },
          { color: "#C47A10", label: "Medium" },
          { color: "#DC2626", label: "Critical" },
        ].map((l) => (
          <div key={l.label} className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: l.color }} />
            <span style={{ color: "#8A9480" }}>{l.label}</span>
          </div>
        ))}
      </div>

      <div className="absolute top-3 left-3 z-[1000] bg-white rounded-xl px-3 py-2 shadow-md text-xs"
        style={{ color: "#4A7C28" }}>
        👆 Click map to drop pin · Drag to adjust
      </div>
    </div>
  );
}
