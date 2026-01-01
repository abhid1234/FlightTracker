import { NextResponse } from 'next/server';

interface Flight {
    flightNumber: string;
    origin: {
        code: string;
        city: string;
        time: string;
        timezone: string;
        terminal?: string;
        gate?: string;
    };
    destination: {
        code: string;
        city: string;
        time: string;
        timezone: string;
        terminal?: string;
        gate?: string;
    };
    status: string;
    aircraft?: {
        model: string;
    };
    live?: {
        latitude: number;
        longitude: number;
        altitude: number;
        speed_horizontal: number;
        direction: number;
        is_ground: boolean;
    };
}

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query')?.replace(/\s+/g, '');
    const date = searchParams.get('date');

    if (!query) {
        return NextResponse.json({ error: 'Flight number is required' }, { status: 400 });
    }

    const API_KEY = process.env.AVIATIONSTACK_API_KEY;

    if (!API_KEY) {
        console.error("No API key found");
        return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
    }

    try {
        let apiUrl = `http://api.aviationstack.com/v1/flights?access_key=${API_KEY}&flight_iata=${query}&limit=100`;
        if (date) {
            apiUrl += `&flight_date=${date}`;
        }
        console.log(`Fetching from: ${apiUrl.replace(API_KEY, '[REDACTED]')}`);

        const res = await fetch(apiUrl);
        const data = await res.json();

        console.log('Aviationstack response status:', res.status);
        console.log('Aviationstack data count:', data.data ? data.data.length : 0);

        if (!data.data || data.data.length === 0) {
            console.log('No data found in API response');
            return NextResponse.json([]);
        }

        let flightData = data.data;

        // Deduplicate flights based on flight number and departure time
        const uniqueFlights = new Map();
        flightData.forEach((item: any) => {
            const key = `${item.flight.iata}-${item.departure.scheduled}`;
            if (!uniqueFlights.has(key)) {
                uniqueFlights.set(key, item);
            }
        });

        // Map Aviationstack data to our Flight interface
        const processedFlights: Flight[] = flightData.map((item: any) => ({
            flightNumber: item.flight.iata,
            origin: {
                code: item.departure.iata,
                city: item.departure.airport,
                time: item.departure.scheduled,
                timezone: item.departure.timezone,
                terminal: item.departure.terminal,
                gate: item.departure.gate,
            },
            destination: {
                code: item.arrival.iata,
                city: item.arrival.airport,
                time: item.arrival.scheduled,
                timezone: item.arrival.timezone,
                terminal: item.arrival.terminal,
                gate: item.arrival.gate,
            },
            status: item.flight_status ? (item.flight_status.charAt(0).toUpperCase() + item.flight_status.slice(1)) : 'Unknown',
            aircraft: item.aircraft ? {
                model: item.aircraft.iata || item.aircraft.icao || item.aircraft.registration || 'Unknown' // Prioritize IATA > ICAO > Registration
            } : undefined,
            live: item.live ? {
                latitude: item.live.latitude,
                longitude: item.live.longitude,
                altitude: item.live.altitude,
                speed_horizontal: item.live.speed_horizontal,
                direction: item.live.direction,
                is_ground: item.live.is_ground,
            } : undefined,
        }));

        // Sort to find the best match
        // Sort all flights by departure time (Oldest to Newest)
        processedFlights.sort((a, b) => new Date(a.origin.time).getTime() - new Date(b.origin.time).getTime());

        const now = new Date();
        let currentFlight: Flight | null = null;

        // 1. Try to find an Active flight (but ensuring it's not stale data from weeks ago)
        // Check if flight time is within the last 48 hours
        const twoDaysAgo = new Date(now.getTime() - (48 * 60 * 60 * 1000));

        currentFlight = processedFlights.find(f =>
            f.status === 'Active' && new Date(f.origin.time) > twoDaysAgo
        ) || null;

        // 2. If no valid Active, find the first flight in the future (Soonest Upcoming)
        if (!currentFlight) {
            currentFlight = processedFlights.find(f => new Date(f.origin.time) > now) || null;
        }

        // 3. If no Active and no Future, pick the last one (Most Recent Past)
        if (!currentFlight && processedFlights.length > 0) {
            currentFlight = processedFlights[processedFlights.length - 1];
        }

        // Categorize others
        const past: Flight[] = [];
        const upcoming: Flight[] = [];

        processedFlights.forEach(flight => {
            if (flight === currentFlight) return;

            const flightTime = new Date(flight.origin.time);
            if (flightTime < now) {
                past.push(flight);
            } else {
                upcoming.push(flight);
            }
        });

        // Sort Past: Newest first (Descending)
        past.sort((a, b) => new Date(b.origin.time).getTime() - new Date(a.origin.time).getTime());

        // Sort Upcoming: Soonest first (Ascending)
        upcoming.sort((a, b) => new Date(a.origin.time).getTime() - new Date(b.origin.time).getTime());

        return NextResponse.json({
            current: currentFlight,
            past,
            upcoming
        });
    } catch (error) {
        console.error('Aviationstack API error:', error);
        return NextResponse.json({ error: 'Failed to fetch flight data' }, { status: 500 });
    }
}
