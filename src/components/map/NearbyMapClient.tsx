"use client";

import { useState, useEffect, useRef } from "react";
import { Search, Filter, MapPin, Star, Phone, X, Navigation } from "lucide-react";

interface Provider {
  id:          string;
  name:        string;
  type:        string;
  description: string | null;
  address:     string;
  city:        string;
  phone:       string;
  rating:      number;
  reviewCount: number;
  isVerified:  boolean;
  latitude:    number;
  longitude:   number;
}

const FILTER_TYPES = [
  { value: "ALL",       label: "All Services", emoji: "🗺️" },
  { value: "VET_CLINIC",label: "Vet Clinics",  emoji: "🏥" },
  { value: "GROOMING",  label: "Grooming",     emoji: "✂️" },
  { value: "DAYCARE",   label: "Daycare",      emoji: "🏡" },
  { value: "SHOP",      label: "Pet Shops",    emoji: "🛒" },
  { value: "RESCUE",    label: "Rescue",       emoji: "🚨" },
];

const TYPE_CONFIG: Record<string, { emoji: string; color: string; bg: string }> = {
  VET_CLINIC: { emoji: "🏥", color: "#2D5016", bg: "#C8DFB0" },
  GROOMING:   { emoji: "✂️", color: "#7A5CB5", bg: "#EDE8F9" },
  DAYCARE:    { emoji: "🏡", color: "#3A7AB5", bg: "#E3EFF8" },
  SHOP:       { emoji: "🛒", color: "#C47A10", bg: "#FDF0D5" },
  RESCUE:     { emoji: "🚨", color: "#C8593A", bg: "#F9EDE8" },
};

export default function NearbyMapClient() {
  const mapRef        = useRef<HTMLDivElement>(null);
  const leafletRef    = useRef<any>(null);
  const markersRef    = useRef<any[]>([]);
  const [providers, setProviders]       = useState<Provider[]>([]);
  const [filtered, setFiltered]         = useState<Provider[]>([]);
  const [selected, setSelected]         = useState<Provider | null>(null);
  const [search, setSearch]             = useState("");
  const [activeFilter, setActiveFilter] = useState("ALL");
  const [loading, setLoading]           = useState(true);
  const [mapLoaded, setMapLoaded]       = useState(false);

  // Fetch providers
  useEffect(() => {
    fetch("/api/map")
      .then((r) => r.json())
      .then((data) => {
        setProviders(data);
        setFiltered(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Filter providers
  useEffect(() => {
    let result = providers;
    if (activeFilter !== "ALL") {
      result = result.filter((p) => p.type === activeFilter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.address.toLowerCase().includes(q) ||
          p.city.toLowerCase().includes(q)
      );
    }
    setFiltered(result);
  }, [search, activeFilter, providers]);

  // Init map
  useEffect(() => {
    if (!mapRef.current || leafletRef.current) return;

    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    document.head.appendChild(link);

    const script = document.createElement("script");
    script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    script.onload = () => {
      const L = (window as any).L;
      const map = L.map(mapRef.current!, {
        center: [23.8103, 90.4125],
        zoom: 12,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      leafletRef.current = map;
      setMapLoaded(true);

      // Try to get user location
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((pos) => {
          map.setView([pos.coords.latitude, pos.coords.longitude], 13);
          L.circleMarker([pos.coords.latitude, pos.coords.longitude], {
            radius: 8, color: "#2D5016", fillColor: "#C8DFB0",
            fillOpacity: 0.9, weight: 2,
          }).addTo(map).bindPopup("📍 You are here");
        }, () => {});
      }
    };
    document.head.appendChild(script);

    return () => {
      if (leafletRef.current) {
        leafletRef.current.remove();
        leafletRef.current = null;
      }
    };
  }, []);

  // Update markers when filtered providers change
  useEffect(() => {
    if (!mapLoaded || !leafletRef.current) return;
    const L = (window as any).L;
    const map = leafletRef.current;

    // Clear old markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    // Add new markers
    filtered.forEach((provider) => {
      const config = TYPE_CONFIG[provider.type] ?? TYPE_CONFIG.VET_CLINIC;

      const icon = L.divIcon({
        html: `<div style="
          width:36px;height:36px;border-radius:50%;
          background:${config.bg};border:2.5px solid ${config.color};
          display:flex;align-items:center;justify-content:center;
          font-size:16px;box-shadow:0 2px 8px rgba(0,0,0,0.2);
          cursor:pointer;transition:transform 0.15s;
        ">${config.emoji}</div>`,
        className: "",
        iconSize:   [36, 36],
        iconAnchor: [18, 18],
        popupAnchor:[0, -20],
      });

      const marker = L.marker([provider.latitude, provider.longitude], { icon })
        .addTo(map)
        .bindPopup(`
          <div style="font-family:sans-serif;min-width:180px;padding:4px">
            <p style="font-weight:700;font-size:13px;margin:0 0 4px;color:#2D5016">${provider.name}</p>
            <p style="font-size:11px;color:#666;margin:0 0 6px">${provider.address}, ${provider.city}</p>
            <div style="display:flex;align-items:center;gap:4px;margin-bottom:6px">
              <span style="color:#E8A030">★</span>
              <span style="font-size:11px;font-weight:600">${provider.rating.toFixed(1)}</span>
              <span style="font-size:10px;color:#999">(${provider.reviewCount})</span>
              ${provider.isVerified ? '<span style="font-size:10px;background:#C8DFB0;color:#2D5016;padding:1px 6px;border-radius:10px;margin-left:4px">✓ Verified</span>' : ""}
            </div>
            <a href="tel:${provider.phone}" style="
              display:block;text-align:center;background:#2D5016;color:#fff;
              padding:5px;border-radius:8px;font-size:11px;text-decoration:none;
            ">${provider.phone}</a>
          </div>
        `);

      marker.on("click", () => setSelected(provider));
      markersRef.current.push(marker);
    });
  }, [filtered, mapLoaded]);

  function flyToProvider(provider: Provider) {
    if (leafletRef.current) {
      leafletRef.current.flyTo([provider.latitude, provider.longitude], 16, {
        animate: true, duration: 1,
      });
    }
    setSelected(provider);
  }

  const config = selected ? TYPE_CONFIG[selected.type] ?? TYPE_CONFIG.VET_CLINIC : null;

  return (
    <div>
      <div className="mb-5">
        <h1 className="font-display text-3xl font-bold text-gray-900">Nearby Pet Services</h1>
        <p className="text-sm mt-1" style={{ color: "#8A9480" }}>
          Find vets, groomers, daycares, shops and rescue centres near you
        </p>
      </div>

      {/* Search + Filters */}
      <div className="bg-white border rounded-2xl p-4 mb-4"
        style={{ borderColor: "rgba(45,80,22,0.1)" }}>
        <div className="flex gap-3 mb-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
              style={{ color: "#8A9480" }} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, address, or area..."
              className="w-full pl-9 pr-4 py-2.5 bg-[#FAF7F2] border rounded-xl text-sm outline-none"
              style={{ borderColor: "rgba(45,80,22,0.15)" }}
            />
            {search && (
              <button onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2">
                <X className="w-3.5 h-3.5" style={{ color: "#8A9480" }} />
              </button>
            )}
          </div>
          <div className="flex items-center gap-1.5 text-sm px-3 py-2.5 rounded-xl border"
            style={{ borderColor: "rgba(45,80,22,0.15)", color: "#8A9480" }}>
            <Filter className="w-4 h-4" />
            <span>{filtered.length} results</span>
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          {FILTER_TYPES.map((f) => (
            <button key={f.value} onClick={() => setActiveFilter(f.value)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all"
              style={activeFilter === f.value
                ? { backgroundColor: "#2D5016", color: "#fff", borderColor: "#2D5016" }
                : { backgroundColor: "#fff", color: "rgba(45,80,22,0.7)", borderColor: "rgba(45,80,22,0.15)" }
              }>
              {f.emoji} {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        {/* Provider list */}
        <div className="bg-white border rounded-2xl overflow-hidden flex flex-col"
          style={{ borderColor: "rgba(45,80,22,0.1)", maxHeight: "600px" }}>
          <div className="p-3 border-b text-xs font-medium"
            style={{ borderColor: "rgba(45,80,22,0.1)", color: "#8A9480" }}>
            {loading ? "Loading..." : `${filtered.length} service${filtered.length !== 1 ? "s" : ""} found`}
          </div>
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="p-8 text-center">
                <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin mx-auto mb-3"
                  style={{ borderColor: "#2D5016", borderTopColor: "transparent" }} />
                <p className="text-sm" style={{ color: "#8A9480" }}>Loading services...</p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="p-8 text-center">
                <MapPin className="w-10 h-10 mx-auto mb-3" style={{ color: "rgba(45,80,22,0.2)" }} />
                <p className="text-sm" style={{ color: "#8A9480" }}>No services found</p>
              </div>
            ) : (
              filtered.map((provider) => {
                const cfg = TYPE_CONFIG[provider.type] ?? TYPE_CONFIG.VET_CLINIC;
                const isSelected = selected?.id === provider.id;
                return (
                  <button key={provider.id} onClick={() => flyToProvider(provider)}
                    className="w-full flex items-start gap-3 p-4 border-b text-left transition-all"
                    style={{
                      borderColor: "rgba(45,80,22,0.08)",
                      backgroundColor: isSelected ? "#F2F7EC" : "transparent",
                    }}>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                      style={{ backgroundColor: cfg.bg }}>{cfg.emoji}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <p className="text-sm font-medium text-gray-900 truncate">{provider.name}</p>
                        {provider.isVerified && (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0"
                            style={{ backgroundColor: cfg.bg, color: cfg.color }}>✓</span>
                        )}
                      </div>
                      <p className="text-xs mt-0.5 truncate" style={{ color: "#8A9480" }}>
                        📍 {provider.address}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] flex items-center gap-0.5" style={{ color: "#C47A10" }}>
                          ★ {provider.rating.toFixed(1)}
                        </span>
                        <span className="text-[10px]" style={{ color: "#8A9480" }}>
                          ({provider.reviewCount} reviews)
                        </span>
                      </div>
                    </div>
                    <Navigation className="w-3.5 h-3.5 flex-shrink-0 mt-1"
                      style={{ color: isSelected ? "#2D5016" : "#C8DFB0" }} />
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Map + detail */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          {/* Map */}
          <div className="bg-white border rounded-2xl overflow-hidden relative"
            style={{ borderColor: "rgba(45,80,22,0.1)", height: "420px" }}>
            <div ref={mapRef} style={{ height: "100%", width: "100%" }} />
            {!mapLoaded && (
              <div className="absolute inset-0 flex items-center justify-center"
                style={{ backgroundColor: "#FAF7F2" }}>
                <div className="text-center">
                  <div className="text-4xl mb-3 animate-pulse">🗺️</div>
                  <p className="text-sm" style={{ color: "#4A7C28" }}>Loading map...</p>
                </div>
              </div>
            )}
            {/* Legend */}
            <div className="absolute top-3 right-3 z-[1000] bg-white rounded-xl p-3 shadow-md text-xs space-y-1.5">
              {Object.entries(TYPE_CONFIG).map(([type, cfg]) => (
                <div key={type} className="flex items-center gap-2">
                  <span>{cfg.emoji}</span>
                  <span style={{ color: "#8A9480" }}>
                    {FILTER_TYPES.find((f) => f.value === type)?.label}
                  </span>
                </div>
              ))}
              <div className="flex items-center gap-2 pt-1 border-t" style={{ borderColor: "rgba(45,80,22,0.1)" }}>
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "#C8DFB0", border: "2px solid #2D5016" }} />
                <span style={{ color: "#8A9480" }}>You</span>
              </div>
            </div>
          </div>

          {/* Selected provider detail */}
          {selected && config ? (
            <div className="bg-white border rounded-2xl p-5"
              style={{ borderColor: "rgba(45,80,22,0.1)" }}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                    style={{ backgroundColor: config.bg }}>{config.emoji}</div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="font-display text-lg font-bold text-gray-900">{selected.name}</h2>
                      {selected.isVerified && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                          style={{ backgroundColor: config.bg, color: config.color }}>✓ Verified</span>
                      )}
                    </div>
                    <p className="text-sm mt-0.5" style={{ color: "#8A9480" }}>
                      📍 {selected.address}, {selected.city}
                    </p>
                    <div className="flex items-center gap-3 mt-1.5">
                      <span className="text-xs flex items-center gap-1" style={{ color: "#C47A10" }}>
                        ★ {selected.rating.toFixed(1)}
                        <span style={{ color: "#8A9480" }}>({selected.reviewCount} reviews)</span>
                      </span>
                    </div>
                  </div>
                </div>
                <button onClick={() => setSelected(null)}
                  className="p-1.5 rounded-lg hover:bg-gray-100 flex-shrink-0">
                  <X className="w-4 h-4" style={{ color: "#8A9480" }} />
                </button>
              </div>
              {selected.description && (
                <p className="text-sm mt-3 leading-relaxed" style={{ color: "#4A7C28" }}>
                  {selected.description}
                </p>
              )}
              <div className="flex gap-3 mt-4">
                <a href={`tel:${selected.phone}`}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium text-white transition-all"
                  style={{ backgroundColor: "#2D5016" }}>
                  <Phone className="w-4 h-4" /> Call Now
                </a>
                <a href={`https://www.google.com/maps/search/?api=1&query=${selected.latitude},${selected.longitude}`}
                  target="_blank" rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium border transition-all"
                  style={{ borderColor: "rgba(45,80,22,0.2)", color: "#2D5016" }}>
                  <Navigation className="w-4 h-4" /> Get Directions
                </a>
              </div>
            </div>
          ) : (
            <div className="bg-white border rounded-2xl p-5 text-center"
              style={{ borderColor: "rgba(45,80,22,0.1)" }}>
              <p className="text-sm" style={{ color: "#8A9480" }}>
                Click a pin on the map or a service in the list to see details
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
