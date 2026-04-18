# ✈️ Smart Travel Planner

An AI-powered travel planning web app that generates personalized day-by-day itineraries in seconds. Built with Next.js, Firebase, and Google Gemini.

🔗 **Live App:** https://aitravelplan.vercel.app

---

## Features

- **AI Itinerary Generation** — Enter a destination, dates, budget, and interests. Gemini 2.5 Flash generates a full structured trip plan in under 10 seconds
- **Day-by-Day Itinerary** — Activities with time slots, locations, costs, and tips for every day
- **Inline Day Editing** — Edit any day's theme, meals, accommodation, and activities directly from the UI
- **AI Chatbot** — Modify the live itinerary through natural language ("change day 2 to beach activities")
- **Interactive Route Map** — Google Maps integration with geocoded markers and polyline route overlays
- **Live Flight Prices** —  real-time airfare estimates with Google Flights booking links
- **Packing List** — Auto-generated and editable via chatbot
- **Currency Converter** — Built-in converter for the destination's currency
- **Best Time to Visit** — Monthly calendar with ratings, weather, and local events
- **Light / Dark Theme** — Persistent theme toggle with localStorage
- **Google Auth** — Sign in with Google, trips saved to Firestore

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) + TypeScript |
| AI Model | Google Gemini 2.5 Flash |
| Auth | Firebase Authentication (Google OAuth) |
| Database | Firebase Firestore |
| Maps | Google Maps JavaScript API |
| Flight Prices | Google Flights |
| Deployment | Vercel (CI/CD from GitHub) |
| Styling | Custom CSS with CSS variables |

---

## Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/UdayTej14/SmartTravelPlanner.git
cd SmartTravelPlanner/smart-travel-planner
npm install
```

### 2. Set up environment variables

Create a `.env.local` file in the root:

```env
# Google Gemini
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key

# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Google Maps
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_maps_api_key


### 3. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Project Structure

```
src/
├── app/
│   ├── api/flights/       # Server-side Amadeus flight search
│   ├── dashboard/         # User's saved trips
│   ├── plan/              # New trip form
│   ├── trips/[id]/        # Trip detail page
│   └── page.tsx           # Landing page
├── components/
│   ├── EditDayModal.tsx   # Inline day editing
│   ├── FlightSearch.tsx   # Flight price lookup
│   ├── TripChatbot.tsx    # AI plan editor chatbot
│   ├── TripMap.tsx        # Google Maps route view
│   └── CurrencyConverter.tsx
├── context/
│   ├── AuthContext.tsx
│   └── ThemeContext.tsx
└── lib/
    ├── gemini.ts          # AI plan generation + chatbot
    └── firestore.ts       # Trip CRUD operations
```

---

## API Keys Required

| Service | Where to get it | Free tier |
|---|---|---|
| Google Gemini | [aistudio.google.com](https://aistudio.google.com) | Yes |
| Firebase | [console.firebase.google.com](https://console.firebase.google.com) | Yes |
| Google Maps | [console.cloud.google.com](https://console.cloud.google.com) | $200/month credit |

---

## Deployment

The app is deployed on Vercel with automatic CI/CD. Every push to `main` triggers a production build and deploy.

To deploy your own instance:
1. Fork this repo
2. Import to [Vercel](https://vercel.com)
3. Add all environment variables in Vercel → Settings → Environment Variables
4. Add your Vercel domain to Firebase → Authentication → Authorized Domains

---

## Author

**Uday Tej Reddy Kusam**
[GitHub](https://github.com/UdayTej14)
