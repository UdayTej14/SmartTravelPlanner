import type { TripPlan } from "@/lib/gemini";

export interface Trip {
  id: string;
  userId: string;
  destination: string;
  days: number;
  travelers: number;
  budget: "budget" | "moderate" | "luxury";
  interests: string[];
  startDate: string;
  plan: TripPlan;
  createdAt: string;
  coverImage?: string;
}

export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

export const INTEREST_OPTIONS = [
  "Culture & History",
  "Food & Cuisine",
  "Adventure & Sports",
  "Nature & Wildlife",
  "Shopping",
  "Nightlife",
  "Art & Museums",
  "Photography",
  "Beach & Relaxation",
  "Hiking & Trekking",
  "Local Experiences",
  "Architecture",
];

export const BUDGET_OPTIONS = [
  { value: "budget", label: "Budget", description: "Hostels, street food, free attractions", icon: "$" },
  { value: "moderate", label: "Moderate", description: "3-star hotels, casual dining, paid attractions", icon: "~" },
  { value: "luxury", label: "Luxury", description: "5-star hotels, fine dining, VIP experiences", icon: "*" },
] as const;
