"use client";

import { useEffect, useRef, useState } from "react";
import { Loader } from "@googlemaps/js-api-loader";
import type { DayPlan } from "@/lib/gemini";
import { MapPin, Loader2 } from "lucide-react";

interface Props {
  destination: string;
  itinerary: DayPlan[];
}

interface DayLocation {
  day: number;
  date: string;
  theme: string;
  locationName: string;
  lat: number;
  lng: number;
  activities: string[];
}

// Day color palette
const DAY_COLORS = [
  "#4f7fff", "#8b5cf6", "#22c55e", "#f59e0b", "#ef4444",
  "#06b6d4", "#ec4899", "#84cc16", "#f97316", "#6366f1",
  "#14b8a6", "#e11d48", "#7c3aed", "#0891b2", "#65a30d",
];

export default function TripMap({ destination, itinerary }: Props) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [resolvedDays, setResolvedDays] = useState(0);
  const [totalDays, setTotalDays] = useState(0);

  useEffect(() => {
    if (!mapRef.current) return;

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!;
    const total = itinerary.length;
    setTotalDays(total);

    const loader = new Loader({
      apiKey,
      version: "weekly",
      libraries: ["places", "geometry"],
    });

    loader.load().then(async () => {
      const google = window.google;
      const isLight = document.documentElement.getAttribute("data-theme") === "light";
      const map = new google.maps.Map(mapRef.current!, {
        zoom: 12,
        center: { lat: 0, lng: 0 },
        mapTypeId: "roadmap",
        styles: isLight ? [] : [
          { elementType: "geometry", stylers: [{ color: "#060d18" }] },
          { elementType: "labels.text.stroke", stylers: [{ color: "#060d18" }] },
          { elementType: "labels.text.fill", stylers: [{ color: "#8ab5d0" }] },
          { featureType: "road", elementType: "geometry", stylers: [{ color: "#1c3550" }] },
          { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#4a7898" }] },
          { featureType: "water", elementType: "geometry", stylers: [{ color: "#020912" }] },
          { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#06b6d4" }] },
          { featureType: "poi", elementType: "geometry", stylers: [{ color: "#0c1a2e" }] },
          { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#071322" }] },
          { featureType: "transit", elementType: "geometry", stylers: [{ color: "#1c3550" }] },
          { featureType: "administrative", elementType: "geometry.stroke", stylers: [{ color: "#254869" }] },
        ],
      });
      const infoBg = isLight ? "#ffffff" : "#112336";
      const infoText = isLight ? "#042238" : "#e2eff8";
      const infoMuted = isLight ? "#4a7898" : "#8ab5d0";
      const infoBorder = isLight ? "#e0f2fe" : "#1c3550";
      const infoSub = isLight ? "#6b94b0" : "#4a7898";

      const geocoder = new google.maps.Geocoder();
      const dayLocations: DayLocation[] = [];

      // Geocode first key location per day
      for (const day of itinerary) {
        const firstActivity = day.activities?.[0];
        if (!firstActivity) continue;

        const query = `${firstActivity.location}, ${destination}`;

        await new Promise<void>((resolve) => {
          geocoder.geocode({ address: query }, (results: google.maps.GeocoderResult[] | null, status: google.maps.GeocoderStatus) => {
            if (status === "OK" && results && results[0]) {
              const loc = results[0].geometry.location;
              dayLocations.push({
                day: day.day,
                date: day.date,
                theme: day.theme,
                locationName: firstActivity.location,
                lat: loc.lat(),
                lng: loc.lng(),
                activities: day.activities.map((a) => `${a.time} — ${a.activity}`),
              });
            }
            setResolvedDays((prev) => prev + 1);
            resolve();
          });
        });
      }

      if (dayLocations.length === 0) {
        // Fall back to centering on destination
        geocoder.geocode({ address: destination }, (results: google.maps.GeocoderResult[] | null, status: google.maps.GeocoderStatus) => {
          if (status === "OK" && results && results[0]) {
            map.setCenter(results[0].geometry.location);
            map.setZoom(11);
          }
        });
        setLoading(false);
        return;
      }

      // Fit map to all markers
      const bounds = new google.maps.LatLngBounds();
      dayLocations.forEach((d) => bounds.extend({ lat: d.lat, lng: d.lng }));
      map.fitBounds(bounds, { top: 60, bottom: 60, left: 60, right: 60 });

      // Draw route polyline
      if (dayLocations.length > 1) {
        const path = dayLocations.map((d) => ({ lat: d.lat, lng: d.lng }));

        // Gradient polyline — draw segments with different colors
        for (let i = 0; i < path.length - 1; i++) {
          new google.maps.Polyline({
            path: [path[i], path[i + 1]],
            geodesic: true,
            strokeColor: DAY_COLORS[i % DAY_COLORS.length],
            strokeOpacity: 0.8,
            strokeWeight: 3,
            map,
          });
        }
      }

      // Add numbered markers for each day
      dayLocations.forEach((dayLoc, idx) => {
        const color = DAY_COLORS[idx % DAY_COLORS.length];

        // Custom SVG marker with day number
        const svgMarker = {
          url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="48" viewBox="0 0 40 48">
              <defs>
                <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="rgba(0,0,0,0.5)"/>
                </filter>
              </defs>
              <path d="M20 0C8.95 0 0 8.95 0 20c0 15 20 28 20 28S40 35 40 20C40 8.95 31.05 0 20 0z"
                    fill="${color}" filter="url(#shadow)"/>
              <circle cx="20" cy="20" r="13" fill="white"/>
              <text x="20" y="25" font-family="Arial, sans-serif" font-size="13" font-weight="bold"
                    fill="${color}" text-anchor="middle">${dayLoc.day}</text>
            </svg>
          `)}`,
          scaledSize: new google.maps.Size(40, 48),
          anchor: new google.maps.Point(20, 48),
        };

        const marker = new google.maps.Marker({
          position: { lat: dayLoc.lat, lng: dayLoc.lng },
          map,
          icon: svgMarker,
          title: `Day ${dayLoc.day}: ${dayLoc.theme}`,
          zIndex: 100 + idx,
        });

        // Info window
        const infoWindow = new google.maps.InfoWindow({
          content: `
            <div style="background:${infoBg};color:${infoText};padding:12px;border-radius:10px;max-width:220px;font-family:Arial,sans-serif;">
              <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">
                <div style="background:${color};color:white;width:26px;height:26px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:bold;font-size:13px;flex-shrink:0;">${dayLoc.day}</div>
                <div>
                  <p style="font-weight:bold;font-size:13px;margin:0;">${dayLoc.theme}</p>
                  <p style="color:${infoMuted};font-size:11px;margin:0;">${dayLoc.date}</p>
                </div>
              </div>
              <p style="color:${infoMuted};font-size:11px;margin-bottom:6px;">${dayLoc.locationName}</p>
              <div style="border-top:1px solid ${infoBorder};padding-top:6px;">
                ${dayLoc.activities.slice(0, 3).map((a) => `<p style="font-size:11px;color:${infoSub};margin:2px 0;">• ${a}</p>`).join("")}
              </div>
            </div>
          `,
        });

        marker.addListener("click", () => {
          infoWindow.open(map, marker);
        });
      });

      setLoading(false);
    }).catch(() => {
      setError("Could not load map. Check your API key.");
      setLoading(false);
    });
  }, [destination, itinerary]);

  return (
    <div className="card overflow-hidden">
      {/* Map Header */}
      <div
        className="flex items-center justify-between px-5 py-3"
        style={{ borderBottom: "1px solid var(--border)" }}
      >
        <div className="flex items-center gap-2">
          <MapPin size={16} style={{ color: "var(--accent-blue)" }} />
          <span className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>
            Route Map — {destination}
          </span>
        </div>
        {loading && (
          <div className="flex items-center gap-2 text-xs" style={{ color: "var(--text-muted)" }}>
            <Loader2 size={12} className="spin" />
            Plotting {resolvedDays}/{totalDays} locations...
          </div>
        )}
      </div>

      {/* Map Container */}
      <div className="relative" style={{ height: "420px" }}>
        <div ref={mapRef} className="w-full h-full" />

        {loading && (
          <div
            className="absolute inset-0 flex flex-col items-center justify-center"
            style={{ background: "var(--bg-card)" }}
          >
            <Loader2 size={28} className="spin mb-3" style={{ color: "var(--accent-blue)" }} />
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              Plotting your route...
            </p>
            <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
              {resolvedDays} of {totalDays} days resolved
            </p>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 flex items-center justify-center" style={{ background: "var(--bg-card)" }}>
            <p className="text-sm" style={{ color: "var(--error)" }}>{error}</p>
          </div>
        )}
      </div>

      {/* Day Legend */}
      {!loading && (
        <div className="px-5 py-3" style={{ borderTop: "1px solid var(--border)" }}>
          <p className="text-xs font-medium mb-2" style={{ color: "var(--text-muted)" }}>CLICK MARKERS FOR DETAILS</p>
          <div className="flex flex-wrap gap-2">
            {itinerary.map((day, idx) => (
              <div key={day.day} className="flex items-center gap-1.5">
                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white"
                  style={{ background: DAY_COLORS[idx % DAY_COLORS.length], fontSize: "10px" }}
                >
                  {day.day}
                </div>
                <span className="text-xs" style={{ color: "var(--text-muted)" }}>{day.theme}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
