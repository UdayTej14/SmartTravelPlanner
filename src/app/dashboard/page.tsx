"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";
import { getUserTrips, deleteTrip } from "@/lib/firestore";
import { useTripStore } from "@/store/tripStore";
import type { Trip } from "@/types";
import {
  Plane, Plus, MapPin, Calendar, Users, Trash2,
  LogOut, Globe, Sparkles, Clock, Pencil
} from "lucide-react";

const BUDGET_COLORS: Record<string, string> = {
  budget: "#22c55e",
  moderate: "#f59e0b",
  luxury: "#8b5cf6",
};

const BUDGET_LABELS: Record<string, string> = {
  budget: "Budget",
  moderate: "Moderate",
  luxury: "Luxury",
};

function TripCard({ trip, onDelete }: { trip: Trip; onDelete: (id: string) => void }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Delete this trip? This cannot be undone.")) return;
    setDeleting(true);
    try {
      await deleteTrip(trip.id);
      onDelete(trip.id);
      toast.success("Trip deleted");
    } catch {
      toast.error("Failed to delete trip");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div
      className="card p-6 cursor-pointer group relative overflow-hidden"
      onClick={() => router.push(`/trips/${trip.id}`)}
    >
      {/* Background accent */}
      <div
        className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-5 -translate-y-8 translate-x-8"
        style={{ background: BUDGET_COLORS[trip.budget] }}
      />

      <div className="flex justify-between items-start mb-4">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
          style={{ background: `${BUDGET_COLORS[trip.budget]}15` }}
        >
          🌍
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => { e.stopPropagation(); router.push(`/trips/${trip.id}`); }}
            className="p-2 rounded-lg transition-colors"
            style={{ background: "rgba(249,115,22,0.1)", color: "var(--accent-blue)" }}
            title="Edit trip"
          >
            <Pencil size={14} />
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="p-2 rounded-lg"
            style={{ background: "rgba(239,68,68,0.1)", color: "#ef4444" }}
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      <h3 className="text-xl font-bold mb-1" style={{ color: "var(--text-primary)" }}>
        {trip.destination}
      </h3>

      <div className="flex flex-wrap gap-2 mb-4">
        <span
          className="text-xs px-2 py-1 rounded-full font-medium"
          style={{
            background: `${BUDGET_COLORS[trip.budget]}18`,
            color: BUDGET_COLORS[trip.budget],
          }}
        >
          {BUDGET_LABELS[trip.budget]}
        </span>
        {trip.interests.slice(0, 2).map((interest) => (
          <span
            key={interest}
            className="text-xs px-2 py-1 rounded-full"
            style={{ background: "var(--bg-secondary)", color: "var(--text-muted)" }}
          >
            {interest}
          </span>
        ))}
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-sm" style={{ color: "var(--text-secondary)" }}>
          <Calendar size={13} style={{ color: "var(--accent-blue)" }} />
          {trip.days} days · From {new Date(trip.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
        </div>
        <div className="flex items-center gap-2 text-sm" style={{ color: "var(--text-secondary)" }}>
          <Users size={13} style={{ color: "var(--accent-purple)" }} />
          {trip.travelers} traveler{trip.travelers > 1 ? "s" : ""}
        </div>
        <div className="flex items-center gap-2 text-sm" style={{ color: "var(--text-secondary)" }}>
          <MapPin size={13} style={{ color: "#22c55e" }} />
          {trip.plan?.itinerary?.length ?? trip.days} days planned
        </div>
      </div>

      <div
        className="mt-4 pt-4 text-xs font-medium"
        style={{ borderTop: "1px solid var(--border)", color: "var(--text-muted)" }}
      >
        Est. Cost: {trip.plan?.totalEstimatedCost ?? "See full plan"}
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="card p-6">
      <div className="shimmer w-12 h-12 rounded-xl mb-4" />
      <div className="shimmer w-3/4 h-6 rounded mb-2" />
      <div className="shimmer w-1/2 h-4 rounded mb-4" />
      <div className="space-y-2">
        <div className="shimmer w-full h-4 rounded" />
        <div className="shimmer w-2/3 h-4 rounded" />
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();
  const { trips, setTrips, removeTrip } = useTripStore();
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      try {
        const data = await getUserTrips(user.uid);
        setTrips(data);
      } catch {
        toast.error("Could not load trips");
      } finally {
        setFetching(false);
      }
    };
    load();
  }, [user, setTrips]);

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
    toast.success("Signed out");
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
        className="glass sticky top-0 z-50 flex justify-between items-center px-6 md:px-10 py-4"
        style={{ borderBottom: "1px solid var(--border)" }}
      >
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg gradient-btn flex items-center justify-center">
            <Plane size={16} className="text-white" />
          </div>
          <span className="font-bold text-lg hidden sm:block" style={{ color: "var(--text-primary)" }}>
            Smart Travel Planner
          </span>
        </Link>

        <div className="flex items-center gap-3">
          <Link
            href="/plan"
            className="gradient-btn text-white px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2"
          >
            <Plus size={14} /> Plan Trip
          </Link>
          <Link
            href="/profile"
            className="flex items-center gap-2 px-3 py-2 rounded-xl transition-all"
            style={{ border: "1px solid var(--border)", color: "var(--text-secondary)" }}
          >
            {user.photoURL ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.photoURL} alt="avatar" className="w-6 h-6 rounded-full" />
            ) : (
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                style={{ background: "var(--accent-blue)", color: "white" }}
              >
                {user.displayName?.[0] ?? "U"}
              </div>
            )}
            <span className="hidden sm:block text-sm">{user.displayName?.split(" ")[0]}</span>
          </Link>
          <button
            onClick={handleSignOut}
            className="p-2 rounded-xl transition-all"
            style={{ border: "1px solid var(--border)", color: "var(--text-muted)" }}
            title="Sign out"
          >
            <LogOut size={16} />
          </button>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
          <div>
            <h1 className="text-3xl font-bold" style={{ color: "var(--text-primary)" }}>
              Welcome back, {user.displayName?.split(" ")[0]} 👋
            </h1>
            <p className="mt-1" style={{ color: "var(--text-secondary)" }}>
              {trips.length === 0
                ? "No trips yet. Start planning your first adventure!"
                : `You have ${trips.length} saved trip${trips.length > 1 ? "s" : ""}`}
            </p>
          </div>
          <Link
            href="/plan"
            className="gradient-btn text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2 self-start sm:self-auto"
          >
            <Sparkles size={16} /> Plan New Trip
          </Link>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[
            { icon: <Globe size={20} />, value: trips.length, label: "Total Trips", color: "var(--accent-blue)" },
            {
              icon: <MapPin size={20} />,
              value: [...new Set(trips.map((t) => t.destination.split(",")[0]))].length,
              label: "Destinations",
              color: "var(--accent-purple)",
            },
            {
              icon: <Calendar size={20} />,
              value: trips.reduce((a, t) => a + t.days, 0),
              label: "Days Planned",
              color: "#22c55e",
            },
            {
              icon: <Clock size={20} />,
              value: trips.reduce((a, t) => a + t.travelers, 0),
              label: "Travelers",
              color: "#f59e0b",
            },
          ].map((stat) => (
            <div key={stat.label} className="card p-5">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                style={{ background: `${stat.color}15`, color: stat.color }}
              >
                {stat.icon}
              </div>
              <div className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>{stat.value}</div>
              <div className="text-sm" style={{ color: "var(--text-muted)" }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Trips Grid */}
        {fetching ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => <SkeletonCard key={i} />)}
          </div>
        ) : trips.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-6 float">✈️</div>
            <h3 className="text-2xl font-bold mb-3" style={{ color: "var(--text-primary)" }}>
              No trips yet!
            </h3>
            <p className="mb-8 max-w-md mx-auto" style={{ color: "var(--text-secondary)" }}>
              Use our AI planner to generate a personalized itinerary for your next destination.
            </p>
            <Link
              href="/plan"
              className="gradient-btn text-white px-8 py-4 rounded-xl font-semibold inline-flex items-center gap-2"
            >
              <Sparkles size={18} /> Plan Your First Trip
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 fade-in">
            {trips.map((trip) => (
              <TripCard key={trip.id} trip={trip} onDelete={removeTrip} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
