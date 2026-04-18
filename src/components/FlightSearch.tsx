"use client";

import { useState } from "react";
import { Plane, ExternalLink, Users, Calendar } from "lucide-react";

interface Props {
  destination: string;
  startDate: string;
  travelers: number;
}

export default function FlightSearch({ destination, startDate, travelers }: Props) {
  const [fromCity, setFromCity] = useState("");

  const destName = destination.split(",")[0].trim();

  const formattedDate = new Date(startDate + "T00:00:00").toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const googleFlightsUrl = () => {
    const base = "https://www.google.com/flights";
    const query = fromCity.trim()
      ? `${fromCity.trim()} to ${destName}`
      : `flights to ${destName}`;
    return `${base}?hl=en#flt=${encodeURIComponent(query)}.${startDate};c:USD;e:1;s:0*${travelers};sd:1;t:f`;
  };

  return (
    <div className="card p-6">
      {/* Header */}
      <h3 className="text-lg font-bold mb-1 flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
        <Plane size={18} style={{ color: "var(--accent-blue)" }} /> Search Flights
      </h3>
      <p className="text-sm mb-5" style={{ color: "var(--text-secondary)" }}>
        Find the best fares to{" "}
        <strong style={{ color: "var(--text-primary)" }}>{destName}</strong> on Google Flights.
      </p>

      {/* Trip info chips */}
      <div className="flex gap-3 mb-5 flex-wrap">
        <div
          className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full"
          style={{ background: "var(--bg-secondary)", color: "var(--text-muted)" }}
        >
          <Calendar size={12} /> {formattedDate}
        </div>
        <div
          className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full"
          style={{ background: "var(--bg-secondary)", color: "var(--text-muted)" }}
        >
          <Users size={12} /> {travelers} traveler{travelers > 1 ? "s" : ""}
        </div>
        <div
          className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full"
          style={{ background: "var(--bg-secondary)", color: "var(--text-muted)" }}
        >
          <Plane size={12} /> One-way · Economy
        </div>
      </div>

      {/* Input + Button */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-muted)" }}>
            FLYING FROM (optional)
          </label>
          <input
            className="input-field"
            placeholder="e.g. New York, London, Dubai"
            value={fromCity}
            onChange={(e) => setFromCity(e.target.value)}
          />
        </div>
        <div className="flex items-end">
          <a
            href={googleFlightsUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="gradient-btn text-white px-5 py-3 rounded-xl font-semibold flex items-center gap-2 w-full sm:w-auto justify-center"
          >
            <ExternalLink size={16} /> Search on Google Flights
          </a>
        </div>
      </div>

      <p className="text-xs mt-4" style={{ color: "var(--text-muted)" }}>
        Opens Google Flights with your destination and travel date pre-filled.
      </p>
    </div>
  );
}
