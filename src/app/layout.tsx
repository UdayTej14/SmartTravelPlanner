import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "@/context/AuthContext";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Smart Travel Planner — AI-Powered Itineraries",
  description:
    "Plan smarter trips with AI. Generate personalized travel itineraries, manage trips, and explore the world.",
  icons: { icon: "/favicon.ico" },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <AuthProvider>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: "#16161f",
                color: "#f0f0f5",
                border: "1px solid #2a2a3a",
                borderRadius: "12px",
              },
              success: { iconTheme: { primary: "#22c55e", secondary: "#16161f" } },
              error: { iconTheme: { primary: "#ef4444", secondary: "#16161f" } },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
