import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY!);

export const geminiModel = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

export interface TripPlanRequest {
  destination: string;
  days: number;
  travelers: number;
  budget: "budget" | "moderate" | "luxury";
  interests: string[];
  startDate: string;
}

export interface DayActivity {
  time: string;
  activity: string;
  description: string;
  location: string;
  cost: string;
  tips: string;
}

export interface DayPlan {
  day: number;
  date: string;
  theme: string;
  activities: DayActivity[];
  meals: { breakfast: string; lunch: string; dinner: string };
  accommodation: string;
  estimatedDailyCost: string;
}

export interface MonthlyRating {
  month: string;
  rating: number;
  label: "Peak" | "High" | "Shoulder" | "Low" | "Avoid";
  reason: string;
  avgTemp: string;
  events: string;
}

export interface TripPlan {
  destination: string;
  duration: number;
  totalEstimatedCost: string;
  currency: string;
  bestTimeToVisit: string;
  weatherInfo: string;
  monthlyRatings: MonthlyRating[];
  packingList: string[];
  importantTips: string[];
  emergencyContacts: { type: string; number: string }[];
  itinerary: DayPlan[];
}

export async function generateTripPlan(request: TripPlanRequest): Promise<TripPlan> {
  const prompt = `You are an expert travel planner. Create a detailed ${request.days}-day trip itinerary for ${request.destination}.

Details:
- Travelers: ${request.travelers} person(s)
- Budget level: ${request.budget}
- Interests: ${request.interests.join(", ")}
- Start date: ${request.startDate}

Return ONLY a valid JSON object (no markdown, no code blocks) with this exact structure:
{
  "destination": "City, Country",
  "duration": ${request.days},
  "totalEstimatedCost": "USD X - Y per person",
  "currency": "local currency name",
  "bestTimeToVisit": "season/months",
  "weatherInfo": "brief weather description for travel dates",
  "monthlyRatings": [
    {
      "month": "January",
      "rating": 3,
      "label": "Shoulder",
      "reason": "brief reason why this month is good or bad",
      "avgTemp": "e.g. 15°C / 59°F",
      "events": "notable events or festivals this month, or 'None'"
    }
  ],
  "packingList": ["item1", "item2", "item3", "item4", "item5", "item6", "item7", "item8"],
  "importantTips": ["tip1", "tip2", "tip3", "tip4", "tip5"],
  "emergencyContacts": [
    {"type": "Police", "number": "local number"},
    {"type": "Ambulance", "number": "local number"},
    {"type": "Tourist Helpline", "number": "local number"}
  ],
  "itinerary": [
    {
      "day": 1,
      "date": "calculated date string",
      "theme": "Arrival & Exploration",
      "activities": [
        {
          "time": "9:00 AM",
          "activity": "Activity name",
          "description": "2-3 sentence description",
          "location": "Specific place name",
          "cost": "estimated cost in USD",
          "tips": "practical tip"
        }
      ],
      "meals": {
        "breakfast": "restaurant name or suggestion",
        "lunch": "restaurant name or suggestion",
        "dinner": "restaurant name or suggestion"
      },
      "accommodation": "hotel/accommodation suggestion",
      "estimatedDailyCost": "USD X - Y per person"
    }
  ]
}

IMPORTANT for monthlyRatings:
- Include ALL 12 months (January through December)
- rating scale: 1=worst, 2=poor, 3=average, 4=good, 5=best
- label must be exactly one of: "Peak", "High", "Shoulder", "Low", "Avoid"
- avgTemp should include both Celsius and Fahrenheit
- Include 3-5 activities per day. Make the itinerary realistic, detailed, and exciting.`;

  const result = await geminiModel.generateContent(prompt);
  const text = result.response.text();
  const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
  return JSON.parse(cleaned) as TripPlan;
}

// ─── Chat with trip assistant ─────────────────────────────────────────────

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ChatResponse {
  text: string;
  packingAdditions?: string[];
  packingRemovals?: string[];
  planUpdates?: DayPlan[];
}

export async function chatWithTripAssistant(
  trip: {
    destination: string;
    days: number;
    travelers: number;
    budget: string;
    interests: string[];
    plan: TripPlan;
  },
  history: ChatMessage[],
  userMessage: string
): Promise<ChatResponse> {
  const itinerarySummary = trip.plan.itinerary
    .map((d) => "Day " + d.day + " (" + d.date + "): " + d.theme + " — " + d.activities.map((a) => a.activity).join(", "))
    .join("\n");

  const systemContext =
    "You are a helpful travel assistant for a trip to " + trip.destination + ".\n" +
    "Trip details: " + trip.days + " days, " + trip.travelers + " traveler(s), " + trip.budget + " budget. " +
    "Interests: " + trip.interests.join(", ") + ".\n" +
    "Total estimated cost: " + trip.plan.totalEstimatedCost + ".\n\n" +
    "Current itinerary summary:\n" + itinerarySummary + "\n\n" +
    "You can help with:\n" +
    "- Budget advice and cost breakdowns\n" +
    "- Suggesting packing list additions or removals\n" +
    "- Modifying specific days in the itinerary (changing activities, meals, accommodation)\n" +
    "- Local tips and recommendations\n\n" +
    "If the user wants to ADD or REMOVE packing list items, include this at the very end:\n" +
    'PACKING_UPDATE:{"add":["item1"],"remove":["item2"]}\n\n' +
    "If the user wants to CHANGE, MODIFY, or UPDATE activities/meals/accommodation for specific days, " +
    "include the updated day(s) as complete JSON objects at the very end:\n" +
    'PLAN_UPDATE:[{"day":N,"date":"...","theme":"...","activities":[{"time":"...","activity":"...","description":"...","location":"...","cost":"...","tips":"..."}],"meals":{"breakfast":"...","lunch":"...","dinner":"..."},"accommodation":"...","estimatedDailyCost":"..."}]\n\n' +
    "Only include days that actually change. Return complete valid day objects.\n" +
    "Keep responses concise, friendly, and under 130 words unless detail is requested.";

  const conversationHistory = history
    .map((m) => (m.role === "user" ? "User" : "Assistant") + ": " + m.content)
    .join("\n");

  const prompt =
    systemContext +
    "\n\n" +
    (conversationHistory ? "Previous conversation:\n" + conversationHistory + "\n\n" : "") +
    "User: " + userMessage;

  const result = await geminiModel.generateContent(prompt);
  const raw = result.response.text().trim();

  let cleanText = raw;
  let packingAdditions: string[] | undefined;
  let packingRemovals: string[] | undefined;
  let planUpdates: DayPlan[] | undefined;

  // Parse PACKING_UPDATE
  const packingMatch = raw.match(/PACKING_UPDATE:(\{[\s\S]*?\})/);
  if (packingMatch) {
    try {
      const update = JSON.parse(packingMatch[1]);
      if (Array.isArray(update.add) && update.add.length > 0) packingAdditions = update.add;
      if (Array.isArray(update.remove) && update.remove.length > 0) packingRemovals = update.remove;
    } catch { /* ignore */ }
  }

  // Parse PLAN_UPDATE
  const planMatch = raw.match(/PLAN_UPDATE:(\[[\s\S]*?\])/);
  if (planMatch) {
    try {
      const parsed = JSON.parse(planMatch[1]);
      if (Array.isArray(parsed) && parsed.length > 0) planUpdates = parsed as DayPlan[];
    } catch { /* ignore */ }
  }

  // Remove update blocks from displayed text
  cleanText = raw
    .replace(/PACKING_UPDATE:\{[\s\S]*?\}/, "")
    .replace(/PLAN_UPDATE:\[[\s\S]*?\]/, "")
    .trim();

  return { text: cleanText, packingAdditions, packingRemovals, planUpdates };
}

// ─── Standalone packing list generator ───────────────────────────────────

export async function generatePackingList(destination: string, days: number, activities: string[]): Promise<string[]> {
  const prompt =
    "Generate a smart packing list for a " + days + "-day trip to " + destination + ".\n" +
    "Activities: " + activities.join(", ") + ".\n" +
    'Return ONLY a JSON array of strings, no markdown. Example: ["Item 1", "Item 2"]';

  const result = await geminiModel.generateContent(prompt);
  const text = result.response.text().replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
  return JSON.parse(text) as string[];
}
