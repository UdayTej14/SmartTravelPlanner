"use client";

import { useState } from "react";
import { Plane, Search, Loader2, Clock, Users, ArrowRight, ExternalLink, AlertCircle } from "lucide-react";

interface FlightResult {
  id: string;
  price: string;
  currency: string;
  airline: string;
  duration: string;
  stops: number;
  departure: string;
  arrival: string;
  depCode: string;
  arrCode: string;
  depDate: string;
  seats: number;
}

const AIRLINE_NAMES: Record<string, string> = {
  AA: "American Airlines", UA: "United Airlines", DL: "Delta Air Lines",
  BA: "British Airways",   LH: "Lufthansa",        AF: "Air France",
  EK: "Emirates",          QR: "Qatar Airways",    SQ: "Singapore Airlines",
  JL: "Japan Airlines",    NH: "ANA",              CX: "Cathay Pacific",
  TK: "Turkish Airlines",  EY: "Etihad Airways",   KE: "Korean Air",
  OZ: "Asiana Airlines",   CA: "Air China",        MU: "China Eastern",
  AI: "Air India",         QF: "Qantas",           AC: "Air Canada",
  WN: "Southwest",         B6: "JetBlue",          AS: "Alaska Airlines",
  VS: "Virgin Atlantic",   IB: "Iberia",           AZ: "ITA Airways",
  FR: "Ryanair",           U2: "easyJet",          VY: "Vueling",
  WZ: "Red Wings",         "6E": "IndiGo",         IX: "Air India Express",
};

interface Props {
  destination: string;
  startDate: string;
  travelers: number;
}

export default function FlightSearch({ destination, startDate, travelers }: Props) {
  const [fromCity, setFromCity] = useState("");
  const [loading, setLoading]   = useState(false);
  const [results, setResults]   = useState<FlightResult[] | null>(null);
  const [error, setError]       = useState("");
  const [originCode, setOriginCode] = useState("");
  const [destCode, setDestCode]     = useState("");

  const search = async () => {
    if (!fromCity.trim()) return;
    setLoading(true);
    setError("");
    setResults(null);

    try {
      // Extract just the city name (e.g. "Tokyo, Japan" → "Tokyo")
      const destCity = destination.split(",")[0].trim();
      const params = new URLSearchParams({
        origin:      fromCity.trim(),
        destination: destCity,
        date:        startDate,
        adults:      String(Math.min(travelers, 9)),
      });
      const res  = await fetch(`/api/flights?${params}`);
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "No flights found"); return; }
      setResults(data.flights);
      setOriginCode(data.originCode);
      setDestCode(data.destCode);
    } catch {
      setError("Could not reach the flights API. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const bookUrl = (f: FlightResult) =>
    `https://www.google.com/flights?hl=en#flt=${f.depCode}.${f.arrCode}.${f.depDate};c:USD;e:1;s:0*1;sd:1;t:f`;

  const stopsLabel = (n: number) =>
    n === 0 ? "Nonstop" : n === 1 ? "1 stop" : `${n} stops`;

  const stopsColor = (n: number) =>
    n === 0 ? "#22c55e" : n === 1 ? "#f59e0b" : "#ef4444";

  return (
    <div className="card p-6">
      {/* Header */}
      <h3 className="text-lg font-bold mb-1 flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
        <Plane size={18} style={{ color: "var(--accent-blue)" }} /> Flight Prices
      </h3>
      <p className="text-sm mb-5" style={{ color: "var(--text-secondary)" }}>
        Search one-way flights to{" "}
        <strong style={{ color: "var(--text-primary)" }}>{destination}</strong> on{" "}
        {new Date(startDate + "T00:00:00").toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}.
      </p>

      {/* Search form */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="flex-1">
          <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-muted)" }}>
            FLYING FROM
          </label>
          <input
            className="input-field"
            placeholder="e.g. New York, London, Mumbai"
            value={fromCity}
            onChange={(e) => setFromCity(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && search()}
            disabled={loading}
          />
        </div>
        <div className="flex items-end">
          <button
            onClick={search}
            disabled={!fromCity.trim() || loading}
            className="gradient-btn text-white px-5 py-3 rounded-xl font-semibold flex items-center gap-2 w-full sm:w-auto"
          >
            {loading ? <Loader2 size={16} className="spin" /> : <Search size={16} />}
            {loading ? "Searching..." : "Search"}
          </button>
        </div>
      </div>

      {/* Trip info chips */}
      <div className="flex gap-3 mb-5 flex-wrap">
        <div className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full"
          style={{ background: "var(--bg-secondary)", color: "var(--text-muted)" }}>
          <Users size={12} /> {travelers} traveler{travelers > 1 ? "s" : ""}
        </div>
        <div className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full"
          style={{ background: "var(--bg-secondary)", color: "var(--text-muted)" }}>
          <Plane size={12} /> One-way · Economy
        </div>
        {originCode && destCode && (
          <div className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full"
            style={{ background: "rgba(14,165,233,0.1)", color: "var(--accent-blue)", border: "1px solid rgba(14,165,233,0.2)" }}>
            {originCode} <ArrowRight size={10} /> {destCode}
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-start gap-3 p-4 rounded-xl" style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}>
          <AlertCircle size={16} className="flex-shrink-0 mt-0.5" style={{ color: "#ef4444" }} />
          <div>
            <p className="text-sm font-medium" style={{ color: "#ef4444" }}>{error}</p>
            <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
              Try a major city or international airport name (e.g. "London" not "Heathrow").
            </p>
          </div>
        </div>
      )}

      {/* Results */}
      {results && results.length > 0 && (
        <div className="space-y-3">
          <p className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>
            {results.length} OPTIONS FOUND · PRICES PER PERSON (USD) · FOR REFERENCE ONLY
          </p>
          {results.map((f) => (
            <div
              key={f.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl transition-all"
              style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)" }}
            >
              {/* Left: airline + route */}
              <div className="flex items-center gap-4">
                {/* Airline badge */}
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0"
                  style={{ background: "rgba(14,165,233,0.12)", color: "var(--accent-blue)", border: "1px solid rgba(14,165,233,0.2)" }}
                >
                  {f.airline}
                </div>
                <div>
                  <p className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>
                    {AIRLINE_NAMES[f.airline] ?? f.airline}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: "var(--text-secondary)" }}>
                    {f.departure} → {f.arrival}
                  </p>
                </div>
              </div>

              {/* Middle: duration + stops */}
              <div className="flex items-center gap-4 sm:justify-center">
                <div className="flex items-center gap-1.5 text-xs" style={{ color: "var(--text-muted)" }}>
                  <Clock size={12} /> {f.duration}
                </div>
                <span
                  className="text-xs px-2 py-1 rounded-full font-medium"
                  style={{ background: `${stopsColor(f.stops)}15`, color: stopsColor(f.stops) }}
                >
                  {stopsLabel(f.stops)}
                </span>
              </div>

              {/* Right: price + book */}
              <div className="flex items-center gap-3 sm:ml-auto">
                <div className="text-right">
                  <p className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
                    ${f.price}
                  </p>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                    {f.seats} seats left
                  </p>
                </div>
                <a
                  href={bookUrl(f)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="gradient-btn text-white px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-1.5 whitespace-nowrap"
                >
                  Book <ExternalLink size={12} />
                </a>
              </div>
            </div>
          ))}

          <p className="text-xs text-center pt-1" style={{ color: "var(--text-muted)" }}>
            Prices shown are indicative. Click Book to see live fares on Google Flights.
          </p>
        </div>
      )}
    </div>
  );
}
