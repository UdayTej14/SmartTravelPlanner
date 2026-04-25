"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";
import { generateTripPlan } from "@/lib/gemini";
import { saveTrip } from "@/lib/firestore";
import { useTripStore } from "@/store/tripStore";
import { INTEREST_OPTIONS, BUDGET_OPTIONS } from "@/types";
import {
  Plane, MapPin, Calendar, Users, Sparkles,
  ArrowLeft, ArrowRight, CheckCircle, Loader2
} from "lucide-react";

const STEPS = ["Destination", "Dates & Travelers", "Budget", "Interests", "Generate"];

export default function PlanPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { addTrip, setIsGenerating } = useTripStore();

  const [step, setStep] = useState(0);
  const [generating, setGenerating] = useState(false);

  // Form state
  const [destination, setDestination] = useState("");
  const [days, setDays] = useState(5);
  const [travelers, setTravelers] = useState(1);
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().split("T")[0];
  });
  const [budget, setBudget] = useState<"budget" | "moderate" | "luxury">("moderate");
  const [interests, setInterests] = useState<string[]>([]);

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [user, loading, router]);

  const toggleInterest = (interest: string) => {
    setInterests((prev) =>
      prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest]
    );
  };

  const canProceed = () => {
    if (step === 0) return destination.trim().length >= 2;
    if (step === 1) return days >= 1 && days <= 30 && travelers >= 1;
    if (step === 2) return !!budget;
    if (step === 3) return interests.length >= 1;
    return true;
  };

  const handleGenerate = async () => {
    if (!user) return;
    setGenerating(true);
    setIsGenerating(true);

    const toastId = toast.loading("Gemini AI is crafting your itinerary...");

    try {
      const plan = await generateTripPlan({
        destination,
        days,
        travelers,
        budget,
        interests,
        startDate,
      });

      const tripId = await saveTrip(user.uid, {
        userId: user.uid,
        destination,
        days,
        travelers,
        budget,
        interests,
        startDate,
        plan,
      });

      addTrip({
        id: tripId,
        userId: user.uid,
        destination,
        days,
        travelers,
        budget,
        interests,
        startDate,
        plan,
        createdAt: new Date().toISOString(),
      });

      toast.success("Your trip is ready!", { id: toastId });
      router.push(`/trips/${tripId}`);
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate trip. Please try again.", { id: toastId });
    } finally {
      setGenerating(false);
      setIsGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--bg-primary)" }}>
        <div className="w-8 h-8 rounded-full border-2 border-t-transparent spin" style={{ borderColor: "var(--accent-blue)" }} />
      </div>
    );
  }

  if (!user) return null;

  return (
    <main className="min-h-screen" style={{ background: "var(--bg-primary)" }}>
      {/* Navbar */}
      <nav
        className="glass sticky top-0 z-50 flex items-center justify-between px-6 md:px-10 py-4"
        style={{ borderBottom: "1px solid var(--border)" }}
      >
        <Link href="/dashboard" className="flex items-center gap-2" style={{ color: "var(--text-secondary)" }}>
          <ArrowLeft size={16} /> Dashboard
        </Link>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg gradient-btn flex items-center justify-center">
            <Plane size={13} className="text-white" />
          </div>
          <span className="font-bold hidden sm:block" style={{ color: "var(--text-primary)" }}>
            Plan a Trip
          </span>
        </div>
        <div className="w-24 text-right text-sm" style={{ color: "var(--text-muted)" }}>
          Step {step + 1} of {STEPS.length}
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-6 py-12">
        {/* Progress */}
        <div className="flex items-center gap-2 mb-12">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-2 flex-1">
              <div
                className="flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold transition-all"
                style={{
                  background: i < step ? "var(--success)" : i === step ? "var(--accent-blue)" : "var(--bg-card)",
                  color: i <= step ? "white" : "var(--text-muted)",
                  border: i > step ? "1px solid var(--border)" : "none",
                }}
              >
                {i < step ? <CheckCircle size={16} /> : i + 1}
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className="flex-1 h-0.5 rounded"
                  style={{ background: i < step ? "var(--success)" : "var(--border)" }}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <div className="fade-in">
          {/* Step 0: Destination */}
          {step === 0 && (
            <div>
              
              <h2 className="text-3xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>
                Where do you want to go?
              </h2>
              <p className="mb-8" style={{ color: "var(--text-secondary)" }}>
                Enter a city, country, or region. Be as specific or broad as you like.
              </p>
              <div className="relative">
                <MapPin
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2"
                  style={{ color: "var(--text-muted)" }}
                />
                <input
                  type="text"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && canProceed() && setStep(1)}
                  placeholder="e.g., Tokyo, Japan or Bali"
                  className="input-field pl-12 text-lg"
                  autoFocus
                />
              </div>
              <div className="flex flex-wrap gap-2 mt-4">
                {["Tokyo", "Paris", "Bali", "New York", "Rome", "Bangkok"].map((d) => (
                  <button
                    key={d}
                    onClick={() => setDestination(d)}
                    className="px-3 py-1.5 rounded-lg text-sm transition-all"
                    style={{
                      background: destination.startsWith(d) ? "rgba(79,127,255,0.2)" : "var(--bg-card)",
                      border: `1px solid ${destination.startsWith(d) ? "var(--accent-blue)" : "var(--border)"}`,
                      color: destination.startsWith(d) ? "var(--accent-blue)" : "var(--text-secondary)",
                    }}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 1: Dates & Travelers */}
          {step === 1 && (
            <div>
              
              <h2 className="text-3xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>
                When and how long?
              </h2>
              <p className="mb-8" style={{ color: "var(--text-secondary)" }}>
                Choose your start date, trip duration, and party size.
              </p>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                    <Calendar size={14} className="inline mr-1" /> Start Date
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    min={new Date().toISOString().split("T")[0]}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                    Duration: <span style={{ color: "var(--accent-blue)" }}>{days} days</span>
                  </label>
                  <input
                    type="range"
                    min={1}
                    max={30}
                    value={days}
                    onChange={(e) => setDays(Number(e.target.value))}
                    className="w-full accent-blue-500"
                  />
                  <div className="flex justify-between text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                    <span>1 day</span><span>30 days</span>
                  </div>
                  <div className="flex gap-2 mt-3">
                    {[3, 5, 7, 10, 14].map((d) => (
                      <button
                        key={d}
                        onClick={() => setDays(d)}
                        className="flex-1 py-2 rounded-lg text-sm font-medium transition-all"
                        style={{
                          background: days === d ? "rgba(79,127,255,0.2)" : "var(--bg-card)",
                          border: `1px solid ${days === d ? "var(--accent-blue)" : "var(--border)"}`,
                          color: days === d ? "var(--accent-blue)" : "var(--text-secondary)",
                        }}
                      >
                        {d}d
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                    <Users size={14} className="inline mr-1" /> Travelers: <span style={{ color: "var(--accent-blue)" }}>{travelers}</span>
                  </label>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => setTravelers(Math.max(1, travelers - 1))}
                      className="w-10 h-10 rounded-xl font-bold text-xl"
                      style={{ background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
                    >
                      −
                    </button>
                    <span className="text-2xl font-bold w-8 text-center" style={{ color: "var(--text-primary)" }}>
                      {travelers}
                    </span>
                    <button
                      onClick={() => setTravelers(Math.min(20, travelers + 1))}
                      className="w-10 h-10 rounded-xl font-bold text-xl"
                      style={{ background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Budget */}
          {step === 2 && (
            <div>
              
              <h2 className="text-3xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>
                What&apos;s your budget?
              </h2>
              <p className="mb-8" style={{ color: "var(--text-secondary)" }}>
                We&apos;ll tailor accommodation, dining, and activity suggestions accordingly.
              </p>
              <div className="space-y-3">
                {BUDGET_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setBudget(opt.value)}
                    className="w-full flex items-center gap-4 p-5 rounded-xl text-left transition-all"
                    style={{
                      background: budget === opt.value ? "rgba(79,127,255,0.1)" : "var(--bg-card)",
                      border: `2px solid ${budget === opt.value ? "var(--accent-blue)" : "var(--border)"}`,
                    }}
                  >
                    <span className="text-3xl">{opt.icon}</span>
                    <div className="flex-1">
                      <p className="font-bold" style={{ color: "var(--text-primary)" }}>{opt.label}</p>
                      <p className="text-sm" style={{ color: "var(--text-secondary)" }}>{opt.description}</p>
                    </div>
                    {budget === opt.value && (
                      <CheckCircle size={20} style={{ color: "var(--accent-blue)" }} />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Interests */}
          {step === 3 && (
            <div>
              
              <h2 className="text-3xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>
                What are your interests?
              </h2>
              <p className="mb-8" style={{ color: "var(--text-secondary)" }}>
                Select at least one. Your itinerary will be personalised around these.
              </p>
              <div className="flex flex-wrap gap-3">
                {INTEREST_OPTIONS.map((interest) => {
                  const selected = interests.includes(interest);
                  return (
                    <button
                      key={interest}
                      onClick={() => toggleInterest(interest)}
                      className="px-4 py-2 rounded-xl text-sm font-medium transition-all"
                      style={{
                        background: selected ? "rgba(79,127,255,0.15)" : "var(--bg-card)",
                        border: `1px solid ${selected ? "var(--accent-blue)" : "var(--border)"}`,
                        color: selected ? "var(--accent-blue)" : "var(--text-secondary)",
                      }}
                    >
                      
                      {interest}
                    </button>
                  );
                })}
              </div>
              {interests.length > 0 && (
                <p className="mt-4 text-sm" style={{ color: "var(--text-muted)" }}>
                  {interests.length} selected
                </p>
              )}
            </div>
          )}

          {/* Step 4: Review & Generate */}
          {step === 4 && (
            <div>
              
              <h2 className="text-3xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>
                Ready to generate!
              </h2>
              <p className="mb-8" style={{ color: "var(--text-secondary)" }}>
                Review your trip details and let Gemini AI create your perfect itinerary.
              </p>

              <div className="card p-6 space-y-4 mb-8">
                {[
                  { label: "Destination", value: destination, icon: "" },
                  { label: "Start Date", value: new Date(startDate).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" }), icon: "" },
                  { label: "Duration", value: `${days} days`, icon: "" },
                  { label: "Travelers", value: `${travelers} person${travelers > 1 ? "s" : ""}`, icon: "" },
                  { label: "Budget", value: BUDGET_OPTIONS.find((b) => b.value === budget)?.label ?? budget, icon: "" },
                  { label: "Interests", value: interests.join(", "), icon: "" },
                ].map((item) => (
                  <div key={item.label} className="flex justify-between items-start gap-4">
                    <span className="text-sm flex items-center gap-2" style={{ color: "var(--text-muted)" }}>
                      {item.icon} {item.label}
                    </span>
                    <span className="text-sm font-medium text-right" style={{ color: "var(--text-primary)" }}>
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>

              <button
                onClick={handleGenerate}
                disabled={generating}
                className="gradient-btn w-full text-white py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-3 disabled:opacity-70"
              >
                {generating ? (
                  <>
                    <Loader2 size={20} className="spin" />
                    Generating your itinerary...
                  </>
                ) : (
                  <>
                    <Sparkles size={20} />
                    Generate with Gemini AI
                  </>
                )}
              </button>

              {generating && (
                <div className="mt-4 text-center text-sm fade-in" style={{ color: "var(--text-muted)" }}>
                  This usually takes 5-15 seconds. Hang tight!
                </div>
              )}
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        {step < 4 && (
          <div className="flex justify-between mt-10">
            <button
              onClick={() => setStep(Math.max(0, step - 1))}
              disabled={step === 0}
              className="flex items-center gap-2 px-5 py-3 rounded-xl font-medium transition-all disabled:opacity-30"
              style={{ border: "1px solid var(--border)", color: "var(--text-secondary)" }}
            >
              <ArrowLeft size={16} /> Back
            </button>
            <button
              onClick={() => setStep(step + 1)}
              disabled={!canProceed()}
              className="gradient-btn text-white flex items-center gap-2 px-6 py-3 rounded-xl font-semibold disabled:opacity-40"
            >
              {step === 3 ? "Review Trip" : "Next"} <ArrowRight size={16} />
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
