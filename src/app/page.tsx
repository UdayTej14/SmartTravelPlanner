"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  Plane, Globe, Map, Star, Sparkles, Clock, Shield,
  ArrowRight, CheckCircle, Zap
} from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";

const FEATURES = [
  {
    icon: <Sparkles size={24} />,
    title: "AI Itinerary Generation",
    description: "Powered by Gemini 2.5 Flash. Get a full day-by-day travel plan in under 10 seconds.",
    color: "#4f7fff",
  },
  {
    icon: <Map size={24} />,
    title: "Interactive Maps",
    description: "View all your destinations on Google Maps. Explore nearby restaurants, hotels, and attractions.",
    color: "#8b5cf6",
  },
  {
    icon: <Globe size={24} />,
    title: "Trip Management",
    description: "Save, organize, and revisit all your trips in one place. Access anywhere, anytime.",
    color: "#06b6d4",
  },
  {
    icon: <Clock size={24} />,
    title: "Smart Scheduling",
    description: "Optimized daily schedules with time slots, meal suggestions, and accommodation tips.",
    color: "#f59e0b",
  },
  {
    icon: <Shield size={24} />,
    title: "Packing & Safety",
    description: "Auto-generated packing lists and local emergency contacts for every destination.",
    color: "#22c55e",
  },
  {
    icon: <Star size={24} />,
    title: "Budget Tracking",
    description: "Get estimated daily costs based on your budget level — from backpacker to luxury.",
    color: "#ef4444",
  },
];

const DESTINATIONS = [
  { name: "Tokyo", emoji: "🗼", country: "Japan" },
  { name: "Paris", emoji: "🗺️", country: "France" },
  { name: "Bali", emoji: "🌴", country: "Indonesia" },
  { name: "New York", emoji: "🗽", country: "USA" },
  { name: "Rome", emoji: "🏛️", country: "Italy" },
  { name: "Bangkok", emoji: "🛕", country: "Thailand" },
];

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const handleGetStarted = () => {
    if (user) {
      router.push("/dashboard");
    } else {
      router.push("/login");
    }
  };

  return (
    <main className="min-h-screen" style={{ background: "var(--bg-primary)" }}>
      {/* Navbar */}
      <nav
        className="glass sticky top-0 z-50 flex justify-between items-center px-6 md:px-10 py-4"
        style={{ borderBottom: "1px solid var(--border)" }}
      >
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg gradient-btn flex items-center justify-center">
            <Plane size={16} className="text-white" />
          </div>
          <span className="font-bold text-lg" style={{ color: "var(--text-primary)" }}>
            Smart Travel Planner
          </span>
        </Link>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          {!loading && (
            user ? (
              <Link
                href="/dashboard"
                className="gradient-btn text-white px-5 py-2 rounded-xl font-medium text-sm flex items-center gap-2"
              >
                Dashboard <ArrowRight size={14} />
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-4 py-2 rounded-xl text-sm font-medium transition-colors"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Login
                </Link>
                <Link
                  href="/login"
                  className="gradient-btn text-white px-5 py-2 rounded-xl font-medium text-sm"
                >
                  Get Started Free
                </Link>
              </>
            )
          )}
        </div>
      </nav>

      {/* Hero */}
      <section className="flex flex-col items-center justify-center text-center px-6 pt-24 pb-16">
        <div
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-6"
          style={{
            background: "rgba(14,165,233,0.08)",
            border: "1px solid rgba(14,165,233,0.25)",
            color: "var(--accent-blue)",
          }}
        >
          <Zap size={14} />
          Powered by Gemini 2.5 Flash AI
        </div>

        <h1 className="text-5xl md:text-7xl font-bold max-w-4xl leading-tight mb-6" style={{ color: "var(--text-primary)" }}>
          Plan Your Dream Trip in{" "}
          <span className="gradient-text">Seconds</span>
        </h1>

        <p className="text-xl max-w-2xl mb-10" style={{ color: "var(--text-secondary)" }}>
          Tell us your destination, budget, and interests. Our AI generates a full day-by-day
          itinerary with maps, meals, and local tips — instantly.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 mb-16">
          <button
            onClick={handleGetStarted}
            className="gradient-btn text-white px-8 py-4 rounded-xl font-semibold text-lg flex items-center gap-2 justify-center"
          >
            Start Planning Free <ArrowRight size={18} />
          </button>
          <Link
            href="/login"
            className="flex items-center gap-2 justify-center px-8 py-4 rounded-xl font-semibold text-base transition-all"
            style={{
              border: "1px solid var(--border-light)",
              color: "var(--text-secondary)",
            }}
          >
            View Example Trip
          </Link>
        </div>

        {/* Stats */}
        <div className="flex flex-wrap justify-center gap-8 mb-4">
          {[
            { value: "10s", label: "Average generation time" },
            { value: "Free", label: "No credit card required" },
            { value: "∞", label: "Trips you can create" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-3xl font-bold gradient-text">{stat.value}</div>
              <div className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Popular Destinations */}
      <section className="py-8 px-6 overflow-hidden">
        <p className="text-center text-sm mb-6" style={{ color: "var(--text-muted)" }}>
          POPULAR DESTINATIONS
        </p>
        <div className="flex justify-center flex-wrap gap-3 max-w-3xl mx-auto">
          {DESTINATIONS.map((dest) => (
            <div
              key={dest.name}
              className="card px-5 py-3 flex items-center gap-2 cursor-pointer"
              onClick={handleGetStarted}
            >
              <span className="text-xl">{dest.emoji}</span>
              <div>
                <p className="font-medium text-sm" style={{ color: "var(--text-primary)" }}>{dest.name}</p>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>{dest.country}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <p className="text-center text-sm font-semibold mb-2" style={{ color: "var(--accent-blue)" }}>HOW IT WORKS</p>
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16" style={{ color: "var(--text-primary)" }}>
            From idea to itinerary in 3 steps
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Tell us about your trip",
                desc: "Enter your destination, travel dates, number of travelers, budget, and interests.",
              },
              {
                step: "02",
                title: "AI generates your plan",
                desc: "Gemini AI creates a complete itinerary with activities, meals, tips, and cost estimates.",
              },
              {
                step: "03",
                title: "Save & explore",
                desc: "Save your trip to your dashboard, view it on maps, and share with travel companions.",
              },
            ].map((item) => (
              <div key={item.step} className="relative">
                <div
                  className="text-5xl font-black mb-4 select-none"
                  style={{ color: "rgba(14,165,233,0.1)" }}
                >
                  {item.step}
                </div>
                <h3 className="text-xl font-bold mb-3" style={{ color: "var(--text-primary)" }}>
                  {item.title}
                </h3>
                <p style={{ color: "var(--text-secondary)" }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-6" style={{ background: "var(--bg-secondary)" }}>
        <div className="max-w-5xl mx-auto">
          <p className="text-center text-sm font-semibold mb-2" style={{ color: "var(--accent-purple)" }}>FEATURES</p>
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16" style={{ color: "var(--text-primary)" }}>
            Everything you need for a perfect trip
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((feature) => (
              <div key={feature.title} className="card p-6">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: `${feature.color}18`, color: feature.color }}
                >
                  {feature.icon}
                </div>
                <h3 className="font-bold text-lg mb-2" style={{ color: "var(--text-primary)" }}>
                  {feature.title}
                </h3>
                <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-4xl font-bold mb-4" style={{ color: "var(--text-primary)" }}>
            Ready to plan your next adventure?
          </h2>
          <p className="text-lg mb-8" style={{ color: "var(--text-secondary)" }}>
            Join students and travelers who plan smarter with AI. 100% free, forever.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-6">
            <button
              onClick={handleGetStarted}
              className="gradient-btn text-white px-8 py-4 rounded-xl font-semibold text-lg"
            >
              Start Planning Now — It&apos;s Free
            </button>
          </div>
          <div className="flex flex-wrap justify-center gap-4 text-sm" style={{ color: "var(--text-muted)" }}>
            {["No credit card", "Google Sign-In", "Unlimited trips", "Save & share"].map((item) => (
              <span key={item} className="flex items-center gap-1">
                <CheckCircle size={13} style={{ color: "var(--success)" }} />
                {item}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer
        className="py-8 px-10 flex flex-col sm:flex-row justify-between items-center gap-4"
        style={{ borderTop: "1px solid var(--border)", color: "var(--text-muted)" }}
      >
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded gradient-btn flex items-center justify-center">
            <Plane size={12} className="text-white" />
          </div>
          <span className="text-sm font-medium">Smart Travel Planner</span>
        </div>
        <p className="text-sm">
          © {new Date().getFullYear()} Smart Travel Planner. Built for students, by students.
        </p>
      </footer>
    </main>
  );
}
