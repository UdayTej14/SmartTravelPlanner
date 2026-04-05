import { NextRequest, NextResponse } from "next/server";

const AMADEUS_BASE = "https://test.api.amadeus.com";

async function getToken(): Promise<string> {
  const res = await fetch(`${AMADEUS_BASE}/v1/security/oauth2/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      client_id: process.env.AMADEUS_CLIENT_ID!,
      client_secret: process.env.AMADEUS_CLIENT_SECRET!,
    }),
  });
  if (!res.ok) throw new Error("Failed to get Amadeus token");
  const data = await res.json();
  return data.access_token as string;
}

async function getIataCode(keyword: string, token: string): Promise<string | null> {
  const url = `${AMADEUS_BASE}/v1/reference-data/locations?keyword=${encodeURIComponent(keyword)}&subType=AIRPORT,CITY&sort=analytics.travelers.score&page[limit]=5`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) return null;
  const data = await res.json();
  return (data.data?.[0]?.iataCode as string) ?? null;
}

function parseDuration(iso: string): string {
  const m = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
  if (!m) return iso;
  const h = m[1] ? `${m[1]}h` : "";
  const min = m[2] ? ` ${m[2]}m` : "";
  return (h + min).trim();
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-US", {
    hour: "2-digit", minute: "2-digit", hour12: true,
  });
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const originCity = searchParams.get("origin");
  const destCity   = searchParams.get("destination");
  const date       = searchParams.get("date");
  const adults     = Math.min(Number(searchParams.get("adults") || "1"), 9);

  if (!originCity || !destCity || !date) {
    return NextResponse.json({ error: "Missing origin, destination, or date" }, { status: 400 });
  }

  try {
    const token = await getToken();

    const [originCode, destCode] = await Promise.all([
      getIataCode(originCity, token),
      getIataCode(destCity, token),
    ]);

    if (!originCode) return NextResponse.json({ error: `Airport not found for "${originCity}"` }, { status: 404 });
    if (!destCode)   return NextResponse.json({ error: `Airport not found for "${destCity}"` }, { status: 404 });

    const flightUrl = `${AMADEUS_BASE}/v2/shopping/flight-offers?originLocationCode=${originCode}&destinationLocationCode=${destCode}&departureDate=${date}&adults=${adults}&max=6&currencyCode=USD&nonStop=false`;
    const flightRes = await fetch(flightUrl, { headers: { Authorization: `Bearer ${token}` } });

    if (!flightRes.ok) {
      const err = await flightRes.json();
      return NextResponse.json({ error: err?.errors?.[0]?.detail ?? "No flights found" }, { status: 404 });
    }

    const flightData = await flightRes.json();
    if (!flightData.data?.length) {
      return NextResponse.json({ error: "No flights found for this route and date" }, { status: 404 });
    }

    // Simplify the response for the client
    const flights = flightData.data.map((offer: FlightOffer) => {
      const itinerary = offer.itineraries[0];
      const segments  = itinerary.segments;
      const first     = segments[0];
      const last      = segments[segments.length - 1];
      const stops     = segments.length - 1;

      return {
        id:         offer.id,
        price:      Number(offer.price.total).toFixed(2),
        currency:   offer.price.currency,
        airline:    offer.validatingAirlineCodes[0],
        duration:   parseDuration(itinerary.duration),
        stops,
        departure:  formatTime(first.departure.at),
        arrival:    formatTime(last.arrival.at),
        depCode:    originCode,
        arrCode:    destCode,
        depDate:    date,
        seats:      offer.numberOfBookableSeats,
      };
    });

    return NextResponse.json({ flights, originCode, destCode });
  } catch (err) {
    console.error("[flights api]", err);
    return NextResponse.json({ error: "Flight search failed. Check API credentials." }, { status: 500 });
  }
}

// Minimal type for the Amadeus flight offer shape we use
interface FlightOffer {
  id: string;
  numberOfBookableSeats: number;
  validatingAirlineCodes: string[];
  price: { total: string; currency: string };
  itineraries: {
    duration: string;
    segments: {
      departure: { iataCode: string; at: string };
      arrival:   { iataCode: string; at: string };
      carrierCode: string;
      number: string;
    }[];
  }[];
}
