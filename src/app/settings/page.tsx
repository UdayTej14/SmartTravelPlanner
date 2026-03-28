"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";
import { Plane, ArrowLeft, Shield, Bell, Trash2, Info } from "lucide-react";

export default function SettingsPage() {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [user, loading, router]);

  const handleDeleteAccount = async () => {
    if (!confirm("Are you sure? This will permanently delete your account and all trips. This cannot be undone.")) return;
    toast.error("Account deletion requires re-authentication. Please contact support.");
  };

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
    toast.success("Signed out successfully");
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--bg-primary)" }}>
        <div className="w-8 h-8 rounded-full border-2 border-t-transparent spin" style={{ borderColor: "var(--accent-blue)" }} />
      </div>
    );
  }

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
          <span className="font-bold hidden sm:block text-sm" style={{ color: "var(--text-primary)" }}>Settings</span>
        </div>
        <div className="w-20" />
      </nav>

      <div className="max-w-xl mx-auto px-6 py-12 space-y-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>Settings</h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>Manage your account and preferences</p>
        </div>

        {/* Account Info */}
        <div className="card p-6 fade-in">
          <h3 className="font-bold mb-4 flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
            <Shield size={16} style={{ color: "var(--accent-blue)" }} /> Account
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2" style={{ borderBottom: "1px solid var(--border)" }}>
              <span className="text-sm" style={{ color: "var(--text-secondary)" }}>Name</span>
              <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{user.displayName}</span>
            </div>
            <div className="flex justify-between items-center py-2" style={{ borderBottom: "1px solid var(--border)" }}>
              <span className="text-sm" style={{ color: "var(--text-secondary)" }}>Email</span>
              <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{user.email}</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-sm" style={{ color: "var(--text-secondary)" }}>Sign-in Method</span>
              <span
                className="text-xs px-2.5 py-1 rounded-full font-medium"
                style={{ background: "rgba(79,127,255,0.1)", color: "var(--accent-blue)" }}
              >
                Google
              </span>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="mt-4 w-full py-3 rounded-xl text-sm font-medium transition-all"
            style={{ border: "1px solid var(--border)", color: "var(--text-secondary)" }}
          >
            Sign Out
          </button>
        </div>

        {/* Notifications Info */}
        <div className="card p-6 fade-in">
          <h3 className="font-bold mb-4 flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
            <Bell size={16} style={{ color: "var(--accent-purple)" }} /> Notifications
          </h3>
          <div
            className="flex items-start gap-3 p-3 rounded-xl"
            style={{ background: "rgba(79,127,255,0.06)", border: "1px solid rgba(79,127,255,0.15)" }}
          >
            <Info size={14} className="flex-shrink-0 mt-0.5" style={{ color: "var(--accent-blue)" }} />
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              Notification preferences are currently managed through your Google account settings. Browser notifications will be available in a future update.
            </p>
          </div>
        </div>

        {/* About */}
        <div className="card p-6 fade-in">
          <h3 className="font-bold mb-4 flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
            <Info size={16} style={{ color: "#22c55e" }} /> About
          </h3>
          <div className="space-y-2 text-sm" style={{ color: "var(--text-secondary)" }}>
            <div className="flex justify-between">
              <span>Version</span><span style={{ color: "var(--text-muted)" }}>1.0.0</span>
            </div>
            <div className="flex justify-between">
              <span>AI Model</span><span style={{ color: "var(--text-muted)" }}>Gemini 1.5 Flash</span>
            </div>
            <div className="flex justify-between">
              <span>Maps</span><span style={{ color: "var(--text-muted)" }}>Google Maps</span>
            </div>
            <div className="flex justify-between">
              <span>Auth & Storage</span><span style={{ color: "var(--text-muted)" }}>Firebase</span>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="p-6 rounded-xl" style={{ border: "1px solid rgba(239,68,68,0.3)", background: "rgba(239,68,68,0.04)" }}>
          <h3 className="font-bold mb-2 flex items-center gap-2" style={{ color: "#ef4444" }}>
            <Trash2 size={16} /> Danger Zone
          </h3>
          <p className="text-sm mb-4" style={{ color: "var(--text-secondary)" }}>
            Permanently delete your account and all saved trips. This action cannot be undone.
          </p>
          <button
            onClick={handleDeleteAccount}
            className="px-4 py-2 rounded-xl text-sm font-medium transition-all"
            style={{ background: "rgba(239,68,68,0.1)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.3)" }}
          >
            Delete My Account
          </button>
        </div>
      </div>
    </main>
  );
}
