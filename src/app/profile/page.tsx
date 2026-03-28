"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useTripStore } from "@/store/tripStore";
import { Plane, ArrowLeft, Globe, Calendar, Users, LogOut, Mail, Sparkles } from "lucide-react";

export default function ProfilePage() {
  const { user, loading, signOut } = useAuth();
  const { trips } = useTripStore();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [user, loading, router]);

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--bg-primary)" }}>
        <div className="w-8 h-8 rounded-full border-2 border-t-transparent spin" style={{ borderColor: "var(--accent-blue)" }} />
      </div>
    );
  }

  const totalDays = trips.reduce((a, t) => a + t.days, 0);
  const destinations = [...new Set(trips.map((t) => t.destination.split(",")[0]))].length;

  return (
    <main className="min-h-screen" style={{ background: "var(--bg-primary)" }}>
      <nav
        className="glass sticky top-0 z-50 flex items-center justify-between px-6 md:px-10 py-4"
        style={{ borderBottom: "1px solid var(--border)" }}
      >
        <Link href="/dashboard" className="flex items-center gap-2 text-sm" style={{ color: "var(--text-secondary)" }}>
          <ArrowLeft size={16} /> Dashboard
        </Link>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg gradient-btn flex items-center justify-center">
            <Plane size={13} className="text-white" />
          </div>
          <span className="font-bold hidden sm:block text-sm" style={{ color: "var(--text-primary)" }}>My Profile</span>
        </div>
        <button
          onClick={handleSignOut}
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-all"
          style={{ border: "1px solid var(--border)", color: "var(--text-secondary)" }}
        >
          <LogOut size={14} /> Sign Out
        </button>
      </nav>

      <div className="max-w-2xl mx-auto px-6 py-12">
        {/* Avatar + Name */}
        <div className="card p-8 text-center mb-6 fade-in">
          {user.photoURL ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={user.photoURL}
              alt="Profile"
              className="w-24 h-24 rounded-full mx-auto mb-4 border-4"
              style={{ borderColor: "var(--accent-blue)" }}
            />
          ) : (
            <div
              className="w-24 h-24 rounded-full mx-auto mb-4 flex items-center justify-center text-3xl font-bold"
              style={{ background: "var(--accent-gradient)", color: "white" }}
            >
              {user.displayName?.[0] ?? "U"}
            </div>
          )}
          <h1 className="text-2xl font-bold mb-1" style={{ color: "var(--text-primary)" }}>
            {user.displayName}
          </h1>
          <div className="flex items-center justify-center gap-1.5 text-sm" style={{ color: "var(--text-secondary)" }}>
            <Mail size={14} /> {user.email}
          </div>
          <div
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium mt-3"
            style={{ background: "rgba(79,127,255,0.1)", color: "var(--accent-blue)", border: "1px solid rgba(79,127,255,0.25)" }}
          >
            <Sparkles size={11} /> Google Account
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6 fade-in">
          {[
            { icon: <Globe size={20} />, value: trips.length, label: "Trips Created", color: "var(--accent-blue)" },
            { icon: <Calendar size={20} />, value: totalDays, label: "Days Planned", color: "var(--accent-purple)" },
            { icon: <Users size={20} />, value: destinations, label: "Destinations", color: "#22c55e" },
          ].map((stat) => (
            <div key={stat.label} className="card p-5 text-center">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-3"
                style={{ background: `${stat.color}15`, color: stat.color }}
              >
                {stat.icon}
              </div>
              <p className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>{stat.value}</p>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Recent Trips */}
        {trips.length > 0 && (
          <div className="card p-6 fade-in">
            <h3 className="font-bold mb-4" style={{ color: "var(--text-primary)" }}>Recent Trips</h3>
            <div className="space-y-3">
              {trips.slice(0, 5).map((trip) => (
                <Link
                  key={trip.id}
                  href={`/trips/${trip.id}`}
                  className="flex items-center justify-between p-3 rounded-xl transition-all"
                  style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)" }}
                >
                  <div>
                    <p className="font-medium text-sm" style={{ color: "var(--text-primary)" }}>{trip.destination}</p>
                    <p className="text-xs" style={{ color: "var(--text-muted)" }}>{trip.days} days · {new Date(trip.startDate).toLocaleDateString()}</p>
                  </div>
                  <span className="text-xs px-2 py-1 rounded-full capitalize" style={{ background: "rgba(79,127,255,0.1)", color: "var(--accent-blue)" }}>
                    {trip.budget}
                  </span>
                </Link>
              ))}
            </div>
            {trips.length > 5 && (
              <Link href="/dashboard" className="block text-center text-sm mt-4" style={{ color: "var(--accent-blue)" }}>
                View all {trips.length} trips →
              </Link>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
