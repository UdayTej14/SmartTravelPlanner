"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";
import { getTripById, updateTrip } from "@/lib/firestore";
import type { Trip } from "@/types";
import type { DayPlan } from "@/lib/gemini";
import CurrencyConverter from "@/components/CurrencyConverter";
import TripMap from "@/components/TripMap";
import EditTripModal from "@/components/EditTripModal";
import TripChatbot from "@/components/TripChatbot";
import ThemeToggle from "@/components/ThemeToggle";
import {
  Plane, ArrowLeft, MapPin, Calendar, Users, Clock,
  DollarSign, Lightbulb, Package, Phone, Coffee,
  Utensils, Moon, CheckSquare, ExternalLink, Pencil
} from "lucide-react";

// ─── Day card in sidebar ───────────────────────────────────────────────────
function DayCard({ day, isActive, onClick }: { day: DayPlan; isActive: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left p-4 rounded-xl transition-all"
      style={{
        background: isActive ? "rgba(14,165,233,0.12)" : "var(--bg-card)",
        border: `1px solid ${isActive ? "var(--accent-blue)" : "var(--border)"}`,
      }}
    >
      <div className="flex items-center justify-between mb-1">
        <span className="font-bold text-sm" style={{ color: isActive ? "var(--accent-blue)" : "var(--text-primary)" }}>
          Day {day.day}
        </span>
        <span className="text-xs" style={{ color: "var(--text-muted)" }}>{day.date}</span>
      </div>
      <p className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>{day.theme}</p>
      <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>{day.estimatedDailyCost}</p>
    </button>
  );
}

// ─── Packing list item ─────────────────────────────────────────────────────
function PackingItem({ item }: { item: string }) {
  const [checked, setChecked] = useState(false);
  return (
    <button
      onClick={() => setChecked(!checked)}
      className="flex items-center gap-3 p-3 rounded-xl text-left transition-all w-full"
      style={{
        background: checked ? "rgba(34,197,94,0.08)" : "var(--bg-secondary)",
        border: `1px solid ${checked ? "rgba(34,197,94,0.3)" : "var(--border)"}`,
      }}
    >
      <div
        className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0"
        style={{
          background: checked ? "#22c55e" : "transparent",
          border: `2px solid ${checked ? "#22c55e" : "var(--border-light)"}`,
        }}
      >
        {checked && <span className="text-white text-xs">✓</span>}
      </div>
      <span
        className="text-sm"
        style={{
          color: checked ? "var(--text-muted)" : "var(--text-secondary)",
          textDecoration: checked ? "line-through" : "none",
        }}
      >
        {item}
      </span>
    </button>
  );
}

// ─── Monthly ratings chart ────────────────────────────────────────────────
const LABEL_COLORS: Record<string, { bg: string; text: string }> = {
  Peak:     { bg: "rgba(239,68,68,0.15)",   text: "#ef4444" },
  High:     { bg: "rgba(245,158,11,0.15)",  text: "#f59e0b" },
  Shoulder: { bg: "rgba(14,165,233,0.15)",  text: "#0ea5e9" },
  Low:      { bg: "rgba(34,197,94,0.15)",   text: "#22c55e" },
  Avoid:    { bg: "rgba(100,100,120,0.15)", text: "#606078" },
};

function MonthlyCalendar({ monthlyRatings }: { monthlyRatings: NonNullable<Trip["plan"]["monthlyRatings"]> }) {
  const [selected, setSelected] = useState<number | null>(null);

  return (
    <div className="card p-6">
      <h3 className="text-lg font-bold mb-2 flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
        🗓️ Best Time to Visit
      </h3>
      <p className="text-sm mb-5" style={{ color: "var(--text-secondary)" }}>
        Click any month for details on weather, events, and crowd levels.
      </p>

      {/* Legend */}
      <div className="flex flex-wrap gap-2 mb-5">
        {Object.entries(LABEL_COLORS).map(([label, colors]) => (
          <span
            key={label}
            className="text-xs px-2.5 py-1 rounded-full font-medium"
            style={{ background: colors.bg, color: colors.text }}
          >
            {label}
          </span>
        ))}
      </div>

      {/* Month Grid */}
      <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 mb-4">
        {monthlyRatings.map((m, idx) => {
          const colors = LABEL_COLORS[m.label] ?? LABEL_COLORS["Shoulder"];
          const isSelected = selected === idx;
          return (
            <button
              key={m.month}
              onClick={() => setSelected(isSelected ? null : idx)}
              className="flex flex-col items-center p-3 rounded-xl transition-all"
              style={{
                background: isSelected ? colors.bg : "var(--bg-secondary)",
                border: `2px solid ${isSelected ? colors.text : "var(--border)"}`,
              }}
            >
              <span className="text-xs font-bold mb-1.5" style={{ color: isSelected ? colors.text : "var(--text-secondary)" }}>
                {m.month.slice(0, 3)}
              </span>
              {/* Rating dots */}
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <div
                    key={star}
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ background: star <= m.rating ? colors.text : "var(--border)" }}
                  />
                ))}
              </div>
              <span className="text-xs mt-1" style={{ color: colors.text, fontSize: "9px" }}>
                {m.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Selected Month Detail */}
      {selected !== null && monthlyRatings[selected] && (
        <div
          className="p-4 rounded-xl fade-in"
          style={{
            background: LABEL_COLORS[monthlyRatings[selected].label]?.bg ?? "var(--bg-secondary)",
            border: `1px solid ${LABEL_COLORS[monthlyRatings[selected].label]?.text ?? "var(--border)"}20`,
          }}
        >
          <div className="flex items-start justify-between gap-4 mb-3">
            <div>
              <h4 className="font-bold" style={{ color: "var(--text-primary)" }}>
                {monthlyRatings[selected].month}
              </h4>
              <span
                className="text-xs px-2 py-0.5 rounded-full font-medium"
                style={{
                  background: LABEL_COLORS[monthlyRatings[selected].label]?.bg,
                  color: LABEL_COLORS[monthlyRatings[selected].label]?.text,
                }}
              >
                {monthlyRatings[selected].label}
              </span>
            </div>
            <div className="text-right">
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>Avg. Temp</p>
              <p className="font-medium text-sm" style={{ color: "var(--text-primary)" }}>
                {monthlyRatings[selected].avgTemp}
              </p>
            </div>
          </div>
          <p className="text-sm mb-2" style={{ color: "var(--text-secondary)" }}>
            {monthlyRatings[selected].reason}
          </p>
          {monthlyRatings[selected].events !== "None" && (
            <p className="text-xs flex items-center gap-1.5" style={{ color: "var(--text-muted)" }}>
              🎉 {monthlyRatings[selected].events}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main page ─────────────────────────────────────────────────────────────
export default function TripDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user, loading } = useAuth();
  const router = useRouter();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [fetching, setFetching] = useState(true);
  const [activeDay, setActiveDay] = useState(0);
  const [activeTab, setActiveTab] = useState<"itinerary" | "overview" | "packing">("itinerary");
  const [editOpen, setEditOpen] = useState(false);
  const [packingList, setPackingList] = useState<string[]>([]);

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [user, loading, router]);

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      try {
        const data = await getTripById(id);
        if (!data) { toast.error("Trip not found"); router.push("/dashboard"); return; }
        setTrip(data);
        setPackingList(data.plan?.packingList ?? []);
      } catch {
        toast.error("Failed to load trip");
      } finally {
        setFetching(false);
      }
    };
    load();
  }, [id, router]);

  if (loading || fetching) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--bg-primary)" }}>
        <div className="text-center">
          <div className="w-10 h-10 rounded-full border-2 border-t-transparent spin mx-auto mb-4" style={{ borderColor: "var(--accent-blue)" }} />
          <p style={{ color: "var(--text-muted)" }}>Loading your trip...</p>
        </div>
      </div>
    );
  }

  if (!trip) return null;

  const handlePlanUpdate = (updatedDays: DayPlan[]) => {
    setTrip((prev) => {
      if (!prev) return prev;
      const newItinerary = prev.plan.itinerary.map((day) => {
        const update = updatedDays.find((d) => d.day === day.day);
        return update ?? day;
      });
      const updated = { ...prev, plan: { ...prev.plan, itinerary: newItinerary } };
      updateTrip(prev.id, { plan: updated.plan }).catch(() => {});
      return updated;
    });
    toast.success(`Updated ${updatedDays.length} day${updatedDays.length > 1 ? "s" : ""} in your itinerary!`);
  };

  const handlePackingUpdate = (additions: string[], removals: string[]) => {
    setPackingList((prev) => {
      const withRemovals = prev.filter(
        (item) => !removals.some((r) => item.toLowerCase().includes(r.toLowerCase()))
      );
      const newItems = additions.filter(
        (a) => !withRemovals.some((item) => item.toLowerCase() === a.toLowerCase())
      );
      const updated = [...withRemovals, ...newItems];
      // Persist to Firestore in background
      updateTrip(trip.id, { plan: { ...trip.plan, packingList: updated } }).catch(() => {});
      return updated;
    });
    if (additions.length > 0) toast.success(`Added ${additions.length} packing item${additions.length > 1 ? "s" : ""}!`);
    if (removals.length > 0) toast.success(`Removed ${removals.length} item${removals.length > 1 ? "s" : ""} from packing list`);
  };

  const { plan } = trip;
  const currentDay = plan.itinerary?.[activeDay];
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(trip.destination)}`;

  return (
    <main className="min-h-screen" style={{ background: "var(--bg-primary)" }}>
      {/* Navbar */}
      <nav
        className="glass sticky top-0 z-50 flex items-center justify-between px-6 md:px-10 py-4"
        style={{ borderBottom: "1px solid var(--border)" }}
      >
        <Link href="/dashboard" className="flex items-center gap-2 text-sm" style={{ color: "var(--text-secondary)" }}>
          <ArrowLeft size={16} /> My Trips
        </Link>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg gradient-btn flex items-center justify-center">
            <Plane size={13} className="text-white" />
          </div>
          <span className="font-bold hidden sm:block text-sm" style={{ color: "var(--text-primary)" }}>
            {trip.destination}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button
            onClick={() => setEditOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all"
            style={{ border: "1px solid var(--border)", color: "var(--text-secondary)" }}
          >
            <Pencil size={14} /> Edit
          </button>
          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all"
            style={{ border: "1px solid var(--border)", color: "var(--text-secondary)" }}
          >
            <ExternalLink size={14} /> Maps
          </a>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 md:px-6 py-8">
        {/* Trip Header */}
        <div className="card p-6 mb-6 fade-in">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>
                {trip.destination} ✈️
              </h1>
              <div className="flex flex-wrap gap-4 text-sm mb-3" style={{ color: "var(--text-secondary)" }}>
                <span className="flex items-center gap-1.5"><Calendar size={14} style={{ color: "var(--accent-blue)" }} />{trip.days} days</span>
                <span className="flex items-center gap-1.5"><Users size={14} style={{ color: "var(--accent-purple)" }} />{trip.travelers} traveler{trip.travelers > 1 ? "s" : ""}</span>
                <span className="flex items-center gap-1.5"><MapPin size={14} style={{ color: "#22c55e" }} />From {new Date(trip.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {trip.interests.map((i) => (
                  <span key={i} className="text-xs px-2.5 py-1 rounded-full" style={{ background: "var(--bg-secondary)", color: "var(--text-muted)", border: "1px solid var(--border)" }}>
                    {i}
                  </span>
                ))}
              </div>
            </div>
            <div className="card p-4 min-w-48">
              <div className="flex items-center gap-2 mb-1">
                <DollarSign size={16} style={{ color: "#22c55e" }} />
                <span className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>Total Est. Cost</span>
              </div>
              <p className="font-bold text-lg" style={{ color: "var(--text-primary)" }}>{plan.totalEstimatedCost}</p>
              <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>Per person · {plan.currency}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
            {[
              { label: "Best Time", value: plan.bestTimeToVisit, icon: <Calendar size={13} /> },
              { label: "Weather", value: plan.weatherInfo, icon: <Clock size={13} /> },
            ].map((item) => (
              <div key={item.label} className="p-3 rounded-xl" style={{ background: "var(--bg-secondary)" }}>
                <div className="flex items-center gap-1.5 mb-1" style={{ color: "var(--text-muted)" }}>
                  {item.icon}
                  <span className="text-xs">{item.label}</span>
                </div>
                <p className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>{item.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {(["itinerary", "overview", "packing"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="px-4 py-2 rounded-xl text-sm font-medium capitalize transition-all"
              style={{
                background: activeTab === tab ? "var(--accent-blue)" : "var(--bg-card)",
                color: activeTab === tab ? "white" : "var(--text-secondary)",
                border: `1px solid ${activeTab === tab ? "var(--accent-blue)" : "var(--border)"}`,
              }}
            >
              {tab === "itinerary" ? "📅 Itinerary" : tab === "overview" ? "🗺️ Map & Info" : "🎒 Packing List"}
            </button>
          ))}
        </div>

        {/* ── ITINERARY TAB ─────────────────────────────────────────────── */}
        {activeTab === "itinerary" && (
          <div className="grid lg:grid-cols-4 gap-6 fade-in">
            <div className="lg:col-span-1 space-y-2">
              <p className="text-xs font-semibold mb-3" style={{ color: "var(--text-muted)" }}>SELECT DAY</p>
              {plan.itinerary?.map((day, idx) => (
                <DayCard key={day.day} day={day} isActive={activeDay === idx} onClick={() => setActiveDay(idx)} />
              ))}
            </div>

            {currentDay && (
              <div className="lg:col-span-3 space-y-4 fade-in">
                <div className="card p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
                        Day {currentDay.day} — {currentDay.theme}
                      </h2>
                      <p className="text-sm" style={{ color: "var(--text-muted)" }}>{currentDay.date}</p>
                    </div>
                    <span className="text-sm font-medium px-3 py-1 rounded-full" style={{ background: "rgba(34,197,94,0.1)", color: "#22c55e" }}>
                      {currentDay.estimatedDailyCost}
                    </span>
                  </div>

                  {/* Meals */}
                  <div className="grid grid-cols-3 gap-3 mb-6">
                    {[
                      { icon: <Coffee size={14} />, label: "Breakfast", value: currentDay.meals.breakfast },
                      { icon: <Utensils size={14} />, label: "Lunch", value: currentDay.meals.lunch },
                      { icon: <Moon size={14} />, label: "Dinner", value: currentDay.meals.dinner },
                    ].map((meal) => (
                      <div key={meal.label} className="p-3 rounded-xl" style={{ background: "var(--bg-secondary)" }}>
                        <div className="flex items-center gap-1.5 mb-1" style={{ color: "var(--accent-blue)" }}>
                          {meal.icon}
                          <span className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>{meal.label}</span>
                        </div>
                        <p className="text-xs" style={{ color: "var(--text-secondary)" }}>{meal.value}</p>
                      </div>
                    ))}
                  </div>

                  {/* Accommodation */}
                  {currentDay.accommodation && (
                    <div className="flex items-center gap-2 p-3 rounded-xl mb-6" style={{ background: "rgba(139,92,246,0.08)", border: "1px solid rgba(139,92,246,0.2)" }}>
                      <Moon size={14} style={{ color: "var(--accent-purple)" }} />
                      <span className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>Stay:</span>
                      <span className="text-sm" style={{ color: "var(--text-secondary)" }}>{currentDay.accommodation}</span>
                    </div>
                  )}

                  {/* Activities */}
                  <div className="space-y-4">
                    {currentDay.activities?.map((activity, idx) => (
                      <div key={idx} className="flex gap-4 p-4 rounded-xl" style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)" }}>
                        <div className="flex flex-col items-center gap-1">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0" style={{ background: "rgba(14,165,233,0.12)", color: "var(--accent-blue)" }}>
                            {idx + 1}
                          </div>
                          {idx < (currentDay.activities?.length ?? 0) - 1 && (
                            <div className="w-0.5 flex-1 min-h-4" style={{ background: "var(--border)" }} />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <div>
                              <p className="font-semibold" style={{ color: "var(--text-primary)" }}>{activity.activity}</p>
                              <p className="text-xs flex items-center gap-1" style={{ color: "var(--text-muted)" }}>
                                <Clock size={10} /> {activity.time} · <MapPin size={10} /> {activity.location}
                              </p>
                            </div>
                            <span className="text-xs px-2 py-1 rounded-full flex-shrink-0" style={{ background: "rgba(34,197,94,0.1)", color: "#22c55e" }}>
                              {activity.cost}
                            </span>
                          </div>
                          <p className="text-sm mb-2" style={{ color: "var(--text-secondary)" }}>{activity.description}</p>
                          {activity.tips && (
                            <div className="flex items-start gap-1.5 text-xs" style={{ color: "var(--text-muted)" }}>
                              <Lightbulb size={11} className="mt-0.5 flex-shrink-0" style={{ color: "#f59e0b" }} />
                              {activity.tips}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── OVERVIEW TAB ─────────────────────────────────────────────── */}
        {activeTab === "overview" && (
          <div className="space-y-6 fade-in">
            {/* Route Map */}
            {plan.itinerary?.length > 0 && (
              <TripMap destination={trip.destination} itinerary={plan.itinerary} />
            )}

            {/* Currency Converter */}
            <CurrencyConverter
              totalCostString={plan.totalEstimatedCost}
              days={trip.days}
              travelers={trip.travelers}
            />

            {/* Monthly Visit Calendar */}
            {plan.monthlyRatings?.length > 0 && (
              <MonthlyCalendar monthlyRatings={plan.monthlyRatings} />
            )}

            {/* Important Tips */}
            {plan.importantTips?.length > 0 && (
              <div className="card p-6">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
                  <Lightbulb size={18} style={{ color: "#f59e0b" }} /> Important Tips
                </h3>
                <div className="grid sm:grid-cols-2 gap-3">
                  {plan.importantTips.map((tip, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 rounded-xl" style={{ background: "var(--bg-secondary)" }}>
                      <CheckSquare size={15} className="flex-shrink-0 mt-0.5" style={{ color: "var(--accent-blue)" }} />
                      <p className="text-sm" style={{ color: "var(--text-secondary)" }}>{tip}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Emergency Contacts */}
            {plan.emergencyContacts?.length > 0 && (
              <div className="card p-6">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
                  <Phone size={18} style={{ color: "#ef4444" }} /> Emergency Contacts
                </h3>
                <div className="grid sm:grid-cols-3 gap-3">
                  {plan.emergencyContacts.map((contact, i) => (
                    <div key={i} className="p-4 rounded-xl text-center" style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}>
                      <p className="text-xs font-medium mb-1" style={{ color: "var(--text-muted)" }}>{contact.type}</p>
                      <p className="text-lg font-bold" style={{ color: "#ef4444" }}>{contact.number}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── PACKING TAB ──────────────────────────────────────────────── */}
        {activeTab === "packing" && (
          <div className="fade-in">
            <div className="card p-6">
              <h3 className="text-lg font-bold mb-2 flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
                <Package size={18} style={{ color: "var(--accent-purple)" }} /> Packing List for {trip.destination}
              </h3>
              <p className="text-sm mb-6" style={{ color: "var(--text-muted)" }}>
                Ask the AI assistant to add or remove items — it will update this list automatically.
              </p>
              <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
                {packingList.map((item, i) => (
                  <PackingItem key={i} item={item} />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Edit Trip Modal */}
      {editOpen && (
        <EditTripModal
          trip={trip}
          onClose={() => setEditOpen(false)}
          onSaved={(updated) => {
            setTrip(updated);
            setPackingList(updated.plan?.packingList ?? []);
          }}
        />
      )}

      {/* AI Trip Chatbot */}
      <TripChatbot
        trip={trip}
        onPackingUpdate={handlePackingUpdate}
        onPlanUpdate={handlePlanUpdate}
      />
    </main>
  );
}
