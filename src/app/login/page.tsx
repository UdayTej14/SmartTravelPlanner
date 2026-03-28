"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";
import { Plane, Globe, Map, Star } from "lucide-react";

export default function LoginPage() {
  const { user, loading, signInWithGoogle } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push("/dashboard");
    }
  }, [user, loading, router]);

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
      toast.success("Welcome back! Redirecting...");
      router.push("/dashboard");
    } catch {
      toast.error("Sign-in failed. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--bg-primary)" }}>
        <div className="w-8 h-8 rounded-full border-2 border-t-transparent spin" style={{ borderColor: "var(--accent-blue)" }} />
      </div>
    );
  }

  return (
    <main className="min-h-screen flex" style={{ background: "var(--bg-primary)" }}>
      {/* Left Panel — Branding */}
      <div
        className="hidden lg:flex flex-col justify-between w-1/2 p-12"
        style={{ background: "var(--bg-secondary)", borderRight: "1px solid var(--border)" }}
      >
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg gradient-btn flex items-center justify-center">
            <Plane size={16} className="text-white" />
          </div>
          <span className="font-bold text-lg" style={{ color: "var(--text-primary)" }}>
            Smart Travel Planner
          </span>
        </Link>

        <div>
          <h1 className="text-4xl font-bold mb-6" style={{ color: "var(--text-primary)" }}>
            Your AI travel companion for every{" "}
            <span className="gradient-text">adventure.</span>
          </h1>
          <p className="text-lg mb-10" style={{ color: "var(--text-secondary)" }}>
            Generate personalized itineraries in seconds. Save trips, track budgets, and explore the world smarter.
          </p>

          <div className="space-y-4">
            {[
              { icon: <Globe size={20} />, title: "200+ Destinations", desc: "AI-powered plans for anywhere in the world" },
              { icon: <Map size={20} />, title: "Day-by-Day Itineraries", desc: "Detailed schedules with maps and tips" },
              { icon: <Star size={20} />, title: "Smart Recommendations", desc: "Personalized based on your interests & budget" },
            ].map((item) => (
              <div key={item.title} className="flex items-start gap-4">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: "rgba(79,127,255,0.15)", color: "var(--accent-blue)" }}
                >
                  {item.icon}
                </div>
                <div>
                  <p className="font-semibold" style={{ color: "var(--text-primary)" }}>{item.title}</p>
                  <p className="text-sm" style={{ color: "var(--text-muted)" }}>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="text-sm" style={{ color: "var(--text-muted)" }}>
          © {new Date().getFullYear()} Smart Travel Planner. Free for students.
        </p>
      </div>

      {/* Right Panel — Sign In */}
      <div className="flex flex-1 items-center justify-center p-8">
        <div className="w-full max-w-md fade-in">
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-2 mb-8">
            <div className="w-8 h-8 rounded-lg gradient-btn flex items-center justify-center">
              <Plane size={16} className="text-white" />
            </div>
            <span className="font-bold text-lg" style={{ color: "var(--text-primary)" }}>
              Smart Travel Planner
            </span>
          </div>

          <h2 className="text-3xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>
            Welcome back
          </h2>
          <p className="mb-8" style={{ color: "var(--text-secondary)" }}>
            Sign in to access your trips and plan new adventures
          </p>

          <button
            onClick={handleGoogleSignIn}
            className="w-full flex items-center justify-center gap-3 py-4 px-6 rounded-xl font-semibold text-base transition-all duration-200 hover:-translate-y-0.5"
            style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border-light)",
              color: "var(--text-primary)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "var(--accent-blue)";
              e.currentTarget.style.boxShadow = "0 4px 20px rgba(79,127,255,0.2)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "var(--border-light)";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            {/* Google Icon */}
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Continue with Google
          </button>

          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
            <span className="text-sm" style={{ color: "var(--text-muted)" }}>100% free, no credit card needed</span>
            <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
          </div>

          <div
            className="rounded-xl p-4 text-sm"
            style={{ background: "rgba(79,127,255,0.08)", border: "1px solid rgba(79,127,255,0.2)" }}
          >
            <p style={{ color: "var(--text-secondary)" }}>
              🔒 We use Google Sign-In for security. Your data is stored safely and never shared.
            </p>
          </div>

          <p className="text-center text-sm mt-6" style={{ color: "var(--text-muted)" }}>
            By signing in, you agree to our{" "}
            <span style={{ color: "var(--accent-blue)", cursor: "pointer" }}>Terms of Service</span>
            {" "}and{" "}
            <span style={{ color: "var(--accent-blue)", cursor: "pointer" }}>Privacy Policy</span>
          </p>
        </div>
      </div>
    </main>
  );
}
