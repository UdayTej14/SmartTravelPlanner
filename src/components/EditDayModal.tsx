"use client";

import { useState } from "react";
import { X, Plus, Trash2, GripVertical } from "lucide-react";
import type { DayPlan, DayActivity } from "@/lib/gemini";

interface Props {
  day: DayPlan;
  onClose: () => void;
  onSave: (updated: DayPlan) => void;
}

const emptyActivity = (): DayActivity => ({
  time: "",
  activity: "",
  description: "",
  location: "",
  cost: "",
  tips: "",
});

export default function EditDayModal({ day, onClose, onSave }: Props) {
  const [form, setForm] = useState<DayPlan>(() => JSON.parse(JSON.stringify(day)));

  const setField = <K extends keyof DayPlan>(key: K, value: DayPlan[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const setMeal = (meal: "breakfast" | "lunch" | "dinner", value: string) => {
    setForm((prev) => ({ ...prev, meals: { ...prev.meals, [meal]: value } }));
  };

  const setActivity = (idx: number, field: keyof DayActivity, value: string) => {
    setForm((prev) => {
      const acts = [...prev.activities];
      acts[idx] = { ...acts[idx], [field]: value };
      return { ...prev, activities: acts };
    });
  };

  const addActivity = () => {
    setForm((prev) => ({ ...prev, activities: [...prev.activities, emptyActivity()] }));
  };

  const removeActivity = (idx: number) => {
    setForm((prev) => ({
      ...prev,
      activities: prev.activities.filter((_, i) => i !== idx),
    }));
  };

  const handleSave = () => {
    onSave(form);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}
    >
      <div
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl"
        style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
      >
        {/* Header */}
        <div
          className="sticky top-0 z-10 flex items-center justify-between px-6 py-4"
          style={{ background: "var(--bg-card)", borderBottom: "1px solid var(--border)" }}
        >
          <div>
            <h2 className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>
              Edit Day {day.day}
            </h2>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>{day.date}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl transition-all"
            style={{ color: "var(--text-muted)", border: "1px solid var(--border)" }}
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Theme & Cost */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold mb-2" style={{ color: "var(--text-muted)" }}>
                DAY THEME
              </label>
              <input
                value={form.theme}
                onChange={(e) => setField("theme", e.target.value)}
                placeholder="e.g. Cultural Exploration"
                className="w-full px-3 py-2.5 rounded-xl text-sm outline-none transition-all"
                style={{
                  background: "var(--bg-secondary)",
                  border: "1px solid var(--border)",
                  color: "var(--text-primary)",
                }}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-2" style={{ color: "var(--text-muted)" }}>
                ESTIMATED DAILY COST
              </label>
              <input
                value={form.estimatedDailyCost}
                onChange={(e) => setField("estimatedDailyCost", e.target.value)}
                placeholder="e.g. $120 - $150"
                className="w-full px-3 py-2.5 rounded-xl text-sm outline-none transition-all"
                style={{
                  background: "var(--bg-secondary)",
                  border: "1px solid var(--border)",
                  color: "var(--text-primary)",
                }}
              />
            </div>
          </div>

          {/* Accommodation */}
          <div>
            <label className="block text-xs font-semibold mb-2" style={{ color: "var(--text-muted)" }}>
              ACCOMMODATION
            </label>
            <input
              value={form.accommodation}
              onChange={(e) => setField("accommodation", e.target.value)}
              placeholder="e.g. Hotel Sunrise, City Center"
              className="w-full px-3 py-2.5 rounded-xl text-sm outline-none transition-all"
              style={{
                background: "var(--bg-secondary)",
                border: "1px solid var(--border)",
                color: "var(--text-primary)",
              }}
            />
          </div>

          {/* Meals */}
          <div>
            <label className="block text-xs font-semibold mb-3" style={{ color: "var(--text-muted)" }}>
              MEALS
            </label>
            <div className="grid grid-cols-3 gap-3">
              {(["breakfast", "lunch", "dinner"] as const).map((meal) => (
                <div key={meal}>
                  <p className="text-xs mb-1.5 capitalize" style={{ color: "var(--text-secondary)" }}>
                    {meal === "breakfast" ? "🌅" : meal === "lunch" ? "☀️" : "🌙"} {meal}
                  </p>
                  <input
                    value={form.meals[meal]}
                    onChange={(e) => setMeal(meal, e.target.value)}
                    placeholder={`${meal} spot`}
                    className="w-full px-3 py-2 rounded-xl text-xs outline-none transition-all"
                    style={{
                      background: "var(--bg-secondary)",
                      border: "1px solid var(--border)",
                      color: "var(--text-primary)",
                    }}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Activities */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-semibold" style={{ color: "var(--text-muted)" }}>
                ACTIVITIES ({form.activities.length})
              </label>
              <button
                onClick={addActivity}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all"
                style={{
                  background: "rgba(14,165,233,0.1)",
                  color: "var(--accent-blue)",
                  border: "1px solid rgba(14,165,233,0.2)",
                }}
              >
                <Plus size={12} /> Add Activity
              </button>
            </div>

            <div className="space-y-4">
              {form.activities.map((act, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl"
                  style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)" }}
                >
                  {/* Activity header */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <GripVertical size={14} style={{ color: "var(--text-muted)" }} />
                      <span
                        className="text-xs font-bold px-2 py-0.5 rounded-full"
                        style={{ background: "rgba(14,165,233,0.12)", color: "var(--accent-blue)" }}
                      >
                        #{idx + 1}
                      </span>
                    </div>
                    <button
                      onClick={() => removeActivity(idx)}
                      className="p-1.5 rounded-lg transition-all"
                      style={{ color: "#ef4444", background: "rgba(239,68,68,0.08)" }}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div>
                      <p className="text-xs mb-1" style={{ color: "var(--text-muted)" }}>Activity Name</p>
                      <input
                        value={act.activity}
                        onChange={(e) => setActivity(idx, "activity", e.target.value)}
                        placeholder="e.g. Visit Eiffel Tower"
                        className="w-full px-3 py-2 rounded-lg text-xs outline-none"
                        style={{
                          background: "var(--bg-card)",
                          border: "1px solid var(--border)",
                          color: "var(--text-primary)",
                        }}
                      />
                    </div>
                    <div>
                      <p className="text-xs mb-1" style={{ color: "var(--text-muted)" }}>Time</p>
                      <input
                        value={act.time}
                        onChange={(e) => setActivity(idx, "time", e.target.value)}
                        placeholder="e.g. 9:00 AM - 11:00 AM"
                        className="w-full px-3 py-2 rounded-lg text-xs outline-none"
                        style={{
                          background: "var(--bg-card)",
                          border: "1px solid var(--border)",
                          color: "var(--text-primary)",
                        }}
                      />
                    </div>
                    <div>
                      <p className="text-xs mb-1" style={{ color: "var(--text-muted)" }}>Location</p>
                      <input
                        value={act.location}
                        onChange={(e) => setActivity(idx, "location", e.target.value)}
                        placeholder="e.g. Champ de Mars, Paris"
                        className="w-full px-3 py-2 rounded-lg text-xs outline-none"
                        style={{
                          background: "var(--bg-card)",
                          border: "1px solid var(--border)",
                          color: "var(--text-primary)",
                        }}
                      />
                    </div>
                    <div>
                      <p className="text-xs mb-1" style={{ color: "var(--text-muted)" }}>Cost</p>
                      <input
                        value={act.cost}
                        onChange={(e) => setActivity(idx, "cost", e.target.value)}
                        placeholder="e.g. $25"
                        className="w-full px-3 py-2 rounded-lg text-xs outline-none"
                        style={{
                          background: "var(--bg-card)",
                          border: "1px solid var(--border)",
                          color: "var(--text-primary)",
                        }}
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <p className="text-xs mb-1" style={{ color: "var(--text-muted)" }}>Description</p>
                    <textarea
                      value={act.description}
                      onChange={(e) => setActivity(idx, "description", e.target.value)}
                      placeholder="Brief description of the activity..."
                      rows={2}
                      className="w-full px-3 py-2 rounded-lg text-xs outline-none resize-none"
                      style={{
                        background: "var(--bg-card)",
                        border: "1px solid var(--border)",
                        color: "var(--text-primary)",
                      }}
                    />
                  </div>

                  <div>
                    <p className="text-xs mb-1" style={{ color: "var(--text-muted)" }}>💡 Tips (optional)</p>
                    <input
                      value={act.tips}
                      onChange={(e) => setActivity(idx, "tips", e.target.value)}
                      placeholder="e.g. Book tickets in advance to skip the queue"
                      className="w-full px-3 py-2 rounded-lg text-xs outline-none"
                      style={{
                        background: "var(--bg-card)",
                        border: "1px solid var(--border)",
                        color: "var(--text-primary)",
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          className="sticky bottom-0 flex items-center justify-end gap-3 px-6 py-4"
          style={{ background: "var(--bg-card)", borderTop: "1px solid var(--border)" }}
        >
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm font-medium transition-all"
            style={{ border: "1px solid var(--border)", color: "var(--text-secondary)" }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 rounded-xl text-sm font-medium text-white gradient-btn transition-all"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
