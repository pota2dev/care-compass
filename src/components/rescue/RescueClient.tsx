"use client";

import { useState } from "react";
import RescueMap from "./RescueMap";
import RescueReportForm from "./RescueReportForm";
import { Phone, MapPin, Star, Clock, AlertTriangle, CheckCircle, Loader } from "lucide-react";

interface Org {
  id: string;
  name: string;
  phone: string;
  address: string;
  city: string;
  rating: number;
}

interface Report {
  id: string;
  animalType: string;
  condition: string;
  location: string;
  city: string;
  latitude: number | null;
  longitude: number | null;
  urgency: string;
  status: string;
  description: string | null;
  createdAt: Date;
  reporter: { name: string };
}

interface Props {
  userId: string | null;
  organizations: Org[];
  recentReports: Report[];
}

const URGENCY_STYLE: Record<string, { bg: string; color: string; label: string }> = {
  LOW:      { bg: "#F2F7EC", color: "#2D5016", label: "Low" },
  MEDIUM:   { bg: "#FDF0D5", color: "#C47A10", label: "Medium" },
  HIGH:     { bg: "#F9EDE8", color: "#C8593A", label: "High" },
  CRITICAL: { bg: "#FEE2E2", color: "#DC2626", label: "Critical 🚨" },
};

const STATUS_STYLE: Record<string, { bg: string; color: string }> = {
  REPORTED:    { bg: "#FDF0D5", color: "#C47A10" },
  ASSIGNED:    { bg: "#E3EFF8", color: "#3A7AB5" },
  IN_PROGRESS: { bg: "#EDE8F9", color: "#7A5CB5" },
  RESCUED:     { bg: "#C8DFB0", color: "#2D5016" },
  CLOSED:      { bg: "#F2F7EC", color: "#8A9480" },
};

const ANIMAL_EMOJI: Record<string, string> = {
  Dog: "🐕", Cat: "🐈", Bird: "🦜", Rabbit: "🐇", Other: "🐾",
};

export default function RescueClient({ userId, organizations, recentReports }: Props) {
  const [activeTab, setActiveTab] = useState<"report" | "map" | "contacts" | "history">("report");
  const [pinnedLocation, setPinnedLocation] = useState<{ lat: number; lng: number; address: string } | null>(null);
  const [submittedId, setSubmittedId] = useState<string | null>(null);
  const [reports, setReports] = useState(recentReports);

  function handleReportSubmitted(newReport: any) {
    setSubmittedId(newReport.id);
    setReports((prev) => [newReport, ...prev]);
    setActiveTab("history");
  }

  const tabs = [
    { id: "report",   label: "🚨 Report",   desc: "Submit a rescue" },
    { id: "map",      label: "🗺️ Map",       desc: "Pin location" },
    { id: "contacts", label: "📞 Contacts",  desc: "Rescue orgs" },
    { id: "history",  label: "📋 History",   desc: "Recent reports" },
  ] as const;

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="font-display text-3xl font-bold text-gray-900">Animal Rescue</h1>
        <p className="text-sm mt-1" style={{ color: "#8A9480" }}>
          Report injured or stray animals — our network responds 24/7
        </p>
      </div>

      {/* Emergency banner */}
      <div className="rounded-2xl p-5 mb-6 flex items-center gap-4 flex-wrap"
        style={{ backgroundColor: "#2D5016" }}>
        <div className="text-4xl flex-shrink-0">🚨</div>
        <div className="flex-1">
          <p className="font-bold text-white text-lg">Emergency? Call now</p>
          <p className="text-sm mt-0.5" style={{ color: "rgba(255,255,255,0.7)" }}>
            24/7 emergency animal rescue hotline across Dhaka
          </p>
        </div>
        <div className="flex gap-3 flex-wrap">
          {organizations.slice(0, 2).map((org) => (
            <a key={org.id} href={`tel:${org.phone}`}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all"
              style={{ backgroundColor: "#C8DFB0", color: "#2D5016" }}>
              <Phone className="w-4 h-4" />
              {org.phone}
            </a>
          ))}
          {organizations.length === 0 && (
            <a href="tel:01700000000"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold"
              style={{ backgroundColor: "#C8DFB0", color: "#2D5016" }}>
              <Phone className="w-4 h-4" /> 01700-RESCUE
            </a>
          )}
        </div>
      </div>

      {/* Success banner after submit */}
      {submittedId && (
        <div className="rounded-2xl p-4 mb-5 flex items-center gap-3"
          style={{ backgroundColor: "#C8DFB0" }}>
          <CheckCircle className="w-5 h-5 flex-shrink-0" style={{ color: "#2D5016" }} />
          <div>
            <p className="font-semibold text-sm" style={{ color: "#2D5016" }}>
              Rescue report submitted successfully!
            </p>
            <p className="text-xs mt-0.5" style={{ color: "#4A7C28" }}>
              Report ID: #{submittedId.slice(-8).toUpperCase()} · Rescue teams have been notified.
            </p>
          </div>
        </div>
      )}

      {/* Tab navigation */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {tabs.map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className="px-5 py-2.5 rounded-xl text-sm font-medium border transition-all"
            style={activeTab === tab.id
              ? { backgroundColor: "#2D5016", color: "#fff", borderColor: "#2D5016" }
              : { backgroundColor: "#fff", color: "rgba(45,80,22,0.7)", borderColor: "rgba(45,80,22,0.15)" }
            }>
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── REPORT TAB ── */}
      {activeTab === "report" && (
        <div className="grid lg:grid-cols-2 gap-6">
          <RescueReportForm
            userId={userId}
            pinnedLocation={pinnedLocation}
            onPinLocation={() => setActiveTab("map")}
            onSubmitted={handleReportSubmitted}
          />
          {/* Quick tips */}
          <div className="space-y-4">
            <div className="bg-white border rounded-2xl p-5"
              style={{ borderColor: "rgba(45,80,22,0.1)" }}>
              <h3 className="font-display text-base font-semibold mb-3">📍 How to Report</h3>
              <ol className="space-y-3">
                {[
                  "Click '🗺️ Map' tab to pin the exact location on the map",
                  "Come back here and fill in the animal details",
                  "Describe the condition and urgency level",
                  "Submit — rescue teams will be notified immediately",
                ].map((step, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm">
                    <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 text-white"
                      style={{ backgroundColor: "#2D5016" }}>{i + 1}</span>
                    <span style={{ color: "#4A7C28" }}>{step}</span>
                  </li>
                ))}
              </ol>
            </div>
            {pinnedLocation && (
              <div className="bg-white border rounded-2xl p-4"
                style={{ borderColor: "rgba(45,80,22,0.1)" }}>
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="w-4 h-4" style={{ color: "#4A7C28" }} />
                  <span className="text-sm font-medium" style={{ color: "#2D5016" }}>Location Pinned ✓</span>
                </div>
                <p className="text-xs" style={{ color: "#8A9480" }}>{pinnedLocation.address}</p>
                <p className="text-xs mt-1" style={{ color: "#8A9480" }}>
                  {pinnedLocation.lat.toFixed(5)}, {pinnedLocation.lng.toFixed(5)}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── MAP TAB ── */}
      {activeTab === "map" && (
        <div>
          <div className="bg-white border rounded-2xl overflow-hidden mb-4"
            style={{ borderColor: "rgba(45,80,22,0.1)" }}>
            <div className="p-4 border-b flex items-center justify-between"
              style={{ borderColor: "rgba(45,80,22,0.1)" }}>
              <div>
                <h2 className="font-display text-base font-semibold">Pin Rescue Location</h2>
                <p className="text-xs mt-0.5" style={{ color: "#8A9480" }}>
                  Click anywhere on the map to drop a pin
                </p>
              </div>
              {pinnedLocation && (
                <button onClick={() => setActiveTab("report")}
                  className="px-4 py-2 rounded-xl text-sm font-medium text-white"
                  style={{ backgroundColor: "#2D5016" }}>
                  Use This Location →
                </button>
              )}
            </div>
            <RescueMap
              pinnedLocation={pinnedLocation}
              onLocationPinned={setPinnedLocation}
              existingReports={reports.filter(r => r.latitude && r.longitude).map(r => ({
                id: r.id,
                lat: r.latitude!,
                lng: r.longitude!,
                animalType: r.animalType,
                urgency: r.urgency,
                status: r.status,
              }))}
            />
          </div>
          {pinnedLocation && (
            <div className="bg-white border rounded-2xl p-4 flex items-center justify-between"
              style={{ borderColor: "rgba(45,80,22,0.1)" }}>
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5" style={{ color: "#C8593A" }} />
                <div>
                  <p className="text-sm font-medium">{pinnedLocation.address}</p>
                  <p className="text-xs" style={{ color: "#8A9480" }}>
                    {pinnedLocation.lat.toFixed(6)}, {pinnedLocation.lng.toFixed(6)}
                  </p>
                </div>
              </div>
              <button onClick={() => setActiveTab("report")}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white"
                style={{ backgroundColor: "#2D5016" }}>
                Confirm & Report →
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── CONTACTS TAB ── */}
      {activeTab === "contacts" && (
        <div className="grid sm:grid-cols-2 gap-4">
          {organizations.length === 0 ? (
            <div className="col-span-2 bg-white border rounded-2xl p-12 text-center"
              style={{ borderColor: "rgba(45,80,22,0.1)" }}>
              <p className="text-sm" style={{ color: "#8A9480" }}>
                No rescue organizations listed yet. Run the seed to add them.
              </p>
            </div>
          ) : (
            organizations.map((org) => (
              <div key={org.id} className="bg-white border rounded-2xl p-5"
                style={{ borderColor: "rgba(45,80,22,0.1)" }}>
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                    style={{ backgroundColor: "#FAF7F2" }}>🏥</div>
                  <div className="flex items-center gap-1 text-xs">
                    <Star className="w-3 h-3" style={{ color: "#E8A030", fill: "#E8A030" }} />
                    <span className="font-medium">{org.rating.toFixed(1)}</span>
                  </div>
                </div>
                <h3 className="font-display text-base font-semibold mb-1">{org.name}</h3>
                <p className="text-xs mb-3 flex items-center gap-1" style={{ color: "#8A9480" }}>
                  <MapPin className="w-3 h-3" /> {org.address}, {org.city}
                </p>
                <a href={`tel:${org.phone}`}
                  className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-semibold transition-all"
                  style={{ backgroundColor: "#2D5016", color: "#fff" }}>
                  <Phone className="w-4 h-4" /> {org.phone}
                </a>
              </div>
            ))
          )}

          {/* Always show emergency numbers */}
          <div className="col-span-full bg-white border rounded-2xl p-5"
            style={{ borderColor: "rgba(45,80,22,0.1)" }}>
            <h3 className="font-display text-base font-semibold mb-3">🇧🇩 Emergency Numbers</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { label: "Police", number: "999" },
                { label: "Fire Service", number: "199" },
                { label: "Animal Welfare", number: "01700-000000" },
              ].map((c) => (
                <a key={c.label} href={`tel:${c.number}`}
                  className="flex flex-col items-center p-3 rounded-xl border text-center transition-all hover:border-[#2D5016]"
                  style={{ borderColor: "rgba(45,80,22,0.15)" }}>
                  <span className="text-xs mb-1" style={{ color: "#8A9480" }}>{c.label}</span>
                  <span className="font-display text-lg font-bold" style={{ color: "#2D5016" }}>{c.number}</span>
                </a>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── HISTORY TAB ── */}
      {activeTab === "history" && (
        <div className="space-y-3">
          {reports.length === 0 ? (
            <div className="bg-white border rounded-2xl p-12 text-center"
              style={{ borderColor: "rgba(45,80,22,0.1)" }}>
              <AlertTriangle className="w-12 h-12 mx-auto mb-4" style={{ color: "rgba(45,80,22,0.2)" }} />
              <p className="text-sm" style={{ color: "#8A9480" }}>No rescue reports yet.</p>
            </div>
          ) : (
            reports.map((r) => {
              const urgency = URGENCY_STYLE[r.urgency] ?? URGENCY_STYLE.MEDIUM;
              const status  = STATUS_STYLE[r.status]  ?? STATUS_STYLE.REPORTED;
              return (
                <div key={r.id} className="bg-white border rounded-2xl p-5"
                  style={{ borderColor: "rgba(45,80,22,0.1)" }}>
                  <div className="flex items-start gap-4">
                    <div className="text-3xl flex-shrink-0">{ANIMAL_EMOJI[r.animalType] ?? "🐾"}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="font-medium text-sm text-gray-900">{r.animalType} — {r.location}</span>
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full"
                          style={{ backgroundColor: urgency.bg, color: urgency.color }}>
                          {urgency.label}
                        </span>
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full"
                          style={{ backgroundColor: status.bg, color: status.color }}>
                          {r.status.replace("_", " ")}
                        </span>
                      </div>
                      <p className="text-xs mb-1" style={{ color: "#8A9480" }}>{r.condition}</p>
                      {r.description && (
                        <p className="text-xs line-clamp-2" style={{ color: "#4A7C28" }}>{r.description}</p>
                      )}
                      <div className="flex items-center gap-3 mt-2 text-[10px]" style={{ color: "#8A9480" }}>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(r.createdAt).toLocaleString("en-BD", {
                            month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
                          })}
                        </span>
                        <span>by {r.reporter.name}</span>
                        <span>#{r.id.slice(-6).toUpperCase()}</span>
                      </div>
                    </div>
                    {r.latitude && r.longitude && (
                      <a href={`https://www.google.com/maps?q=${r.latitude},${r.longitude}`}
                        target="_blank" rel="noopener noreferrer"
                        className="flex-shrink-0 p-2 rounded-lg transition-colors"
                        style={{ backgroundColor: "#FAF7F2" }}>
                        <MapPin className="w-4 h-4" style={{ color: "#2D5016" }} />
                      </a>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
