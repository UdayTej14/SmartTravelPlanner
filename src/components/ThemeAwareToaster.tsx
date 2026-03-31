"use client";

import { Toaster } from "react-hot-toast";
import { useTheme } from "@/context/ThemeContext";

export default function ThemeAwareToaster() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        style: {
          background: isDark ? "#1d1a17" : "#ffffff",
          color: isDark ? "#faf7f4" : "#1a1208",
          border: `1px solid ${isDark ? "#2e2a25" : "rgba(180,140,100,0.25)"}`,
          borderRadius: "12px",
          boxShadow: isDark
            ? "0 8px 24px rgba(0,0,0,0.5)"
            : "0 8px 24px rgba(180,140,100,0.15)",
        },
        success: { iconTheme: { primary: "#22c55e", secondary: isDark ? "#1d1a17" : "#ffffff" } },
        error:   { iconTheme: { primary: "#ef4444", secondary: isDark ? "#1d1a17" : "#ffffff" } },
      }}
    />
  );
}
