"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { updateTrip } from "@/lib/firestore";
import { generateTripPlan } from "@/lib/gemini";
import type { Trip } from "@/types";
import { INTEREST_OPTIONS, BUDGET_OPTIONS } from "@/types";
import { X, Loader2, RefreshCw, Save } from "lucide-react";

interface Props {
  trip: Trip;
  onClose: () => void;
  onSaved: (updated: Trip) => void;
}

export default function EditTripModal({ trip, onClose, onSaved }: Props) {
  const [destination, setDestination] = useState(trip.destination);
  const [days, setDays] = useState(trip.days);
  const [travelers, setTravelers] = useState(trip.travelers);
  const [budget, setBudget] = useState(trip.budget);
  const [interests, setInterests] = useState<string[]>(trip.interests);
  const [startDate, setStartDate] = useState(trip.startDate);
  const [saving, setSaving] = useState(false);
  const [regenerating, setRegenerating] = useState(false);

  const toggleInterest = (i: string) => {
    setInterests((prev) =>
      prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i]
    );
  };

  const handleSave = async () => {
    if (!destination.trim()) { toast.error("Destination is required"); return; }
    setSaving(true);
    try {
      const updates: Partial<Trip> = { destination, days, travelers, budget, interests, startDate };
      await updateTrip(trip.id, updates);
      onSaved({ ...trip, ...updates });
      toast.success("Trip updated!");
      onClose();
    } catch {
      toast.error("Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  const handleRegenerate = async () => {
    if (!destination.trim()) { toast.error("Destination is required"); return; }
    if (interests.length === 0) { toast.error("Select at least one interest"); return; }
    setRegenerating(true);
    try {
      toast.loading("Regenerating itinerary...", { id: "regen" });
      const plan = await generateTripPlan({ destination, days, travelers, budget: budget as "budget" | "moderate" | "luxury", interests, startDate });
      const updates: Partial<Trip> = { destination, days, travelers, budget, interests, startDate, plan };
      await updateTrip(trip.id, updates);
      toast.success("Itinerary regenerated!", { id: "regen" });
      onSaved({ ...trip, ...updates });
      onClose();
    } catch {
      toast.error("Failed to regenerate", { id: "regen" });
    } finally {
      setRegenerating(false);
    }
  };

  const isBusy = saving || regenerating;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="card w-full max-w-xl max-h-[90vh] overflow-y-auto"
        style={{ background: "var(--bg-card)" }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4 sticky top-0"
          style={{ borderBottom: "1px solid var(--border)", background: "var(--bg-card)" }}
        >
          <h2 className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>
            ✏️ Edit Trip
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg transition-colors"
            style={{ color: "var(--text-muted)" }}
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Destination */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
              Destination
            </label>
            <input
              className="input-field"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="e.g. Tokyo, Japan"
              disabled={isBusy}
            />
          </div>

          {/* Days & Travelers */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                Duration (days)
              </label>
              <input
                type="number"
                min={1}
                max={30}
                className="input-field"
                value={days}
                onChange={(e) => setDays(Number(e.target.value))}
                disabled={isBusy}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                Travelers
              </label>
              <input
                type="number"
                min={1}
                max={20}
                className="input-field"
                value={travelers}
                onChange={(e) => setTravelers(Number(e.target.value))}
                disabled={isBusy}
              />
            </div>
          </div>

          {/* Start Date */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
              Start Date
            </label>
            <input
              type="date"
              className="input-field"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              disabled={isBusy}
              style={{ colorScheme: "dark" }}
            />
          </div>

          {/* Budget */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
              Budget Level
            </label>
            <div className="grid grid-cols-3 gap-3">
              {BUDGET_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setBudget(opt.value as "budget" | "moderate" | "luxury")}
                  disabled={isBusy}
                  className="p-3 rounded-xl text-left transition-all"
                  style={{
                    border: `2px solid ${budget === opt.value ? "var(--accent-blue)" : "var(--border)"}`,
                    background: budget === opt.value ? "rgba(14,165,233,0.08)" : "var(--bg-secondary)",
                  }}
                >
                  <div className="text-lg mb-1">{opt.icon}</div>
                  <div className="text-sm font-medium" style={{ color: budget === opt.value ? "var(--accent-blue)" : "var(--text-primary)" }}>
                    {opt.label}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Interests */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
              Interests ({interests.length} selected)
            </label>
            <div className="flex flex-wrap gap-2">
              {INTEREST_OPTIONS.map((i) => (
                <button
                  key={i}
                  onClick={() => toggleInterest(i)}
                  disabled={isBusy}
                  className="px-3 py-1.5 rounded-full text-xs font-medium transition-all"
                  style={{
                    background: interests.includes(i) ? "rgba(14,165,233,0.12)" : "var(--bg-secondary)",
                    border: `1px solid ${interests.includes(i) ? "var(--accent-blue)" : "var(--border)"}`,
                    color: interests.includes(i) ? "var(--accent-blue)" : "var(--text-secondary)",
                  }}
                >
                  {i}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          className="flex flex-col sm:flex-row gap-3 px-6 py-4 sticky bottom-0"
          style={{ borderTop: "1px solid var(--border)", background: "var(--bg-card)" }}
        >
          <button
            onClick={handleSave}
            disabled={isBusy}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium text-sm transition-all"
            style={{ border: "1px solid var(--border)", color: "var(--text-secondary)", background: "var(--bg-secondary)" }}
          >
            {saving ? <Loader2 size={15} className="spin" /> : <Save size={15} />}
            Save Changes
          </button>
          <button
            onClick={handleRegenerate}
            disabled={isBusy}
            className="flex-1 gradient-btn text-white flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold text-sm"
          >
            {regenerating ? <Loader2 size={15} className="spin" /> : <RefreshCw size={15} />}
            Save & Regenerate
          </button>
        </div>
      </div>
    </div>
  );
}
