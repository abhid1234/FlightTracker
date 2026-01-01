import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code')?.toUpperCase();
    const type = searchParams.get('type'); // 'departure' or 'arrival'

    if (!code || !type) {
        return NextResponse.json({ error: 'Airport code and type (departure/arrival) are required' }, { status: 400 });
    }

    const API_KEY = process.env.AVIATIONSTACK_API_KEY;
    if (!API_KEY) {
        return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
    }

    try {
        const param = type === 'departure' ? 'dep_iata' : 'arr_iata';
        let apiUrl = `http://api.aviationstack.com/v1/flights?access_key=${API_KEY}&${param}=${code}&limit=300`;

        // Pass date filter upstream to get historical data
        const dateParam = searchParams.get('date');
        if (dateParam) {
            apiUrl += `&flight_date=${dateParam}`;
        }

        console.log(`Fetching airport data: ${apiUrl.replace(API_KEY, '[REDACTED]')}`);
        const res = await fetch(apiUrl);
        const data = await res.json();

        if (!data.data) {
            console.error('AviationStack Error:', data);
            return NextResponse.json({ error: 'Upstream API Error', details: data });
        }

        // Determine Time Window
        // dateParam is already defined above
        let pastWindow: Date, futureWindow: Date;

        if (dateParam) {
            // User selected a specific date (YYYY-MM-DD)
            // effective window: 00:00 to 23:59 of that day (with slight buffer)
            // User selected a specific date (YYYY-MM-DD)
            // Parse as LOCAL time components to avoid UTC shift issues
            // new Date("2025-12-30") -> UTC Midnight -> Dec 29th 16:00 PST
            // We want Dec 30th 00:00 PST.
            const [y, m, d] = dateParam.split('-').map(Number);

            // Construct start of day in Local Time
            pastWindow = new Date(y, m - 1, d, 0, 0, 0);

            // Construct end of day in Local Time
            futureWindow = new Date(y, m - 1, d, 23, 59, 59, 999);

            // Add 2 hour buffer (instead of 12) to keep days distinct but catch boundary flights
            pastWindow.setHours(pastWindow.getHours() - 2);
            futureWindow.setHours(futureWindow.getHours() + 2);
        } else {
            // Default "Live" window (-6h to +12h is usually enough for a dashboard, 
            // but we keep it wide (-7d) as fallback if user clears date?)
            // Actually, let's keep the wide net if no date selected for "Live" feel
            const now = new Date();
            pastWindow = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));
            futureWindow = new Date(now.getTime() + (7 * 24 * 60 * 60 * 1000));
        }

        console.log(`[API] Window: ${pastWindow.toISOString()} -> ${futureWindow.toISOString()}`);

        const relevantFlights = data.data.filter((f: any) => {
            const timeStr = type === 'departure' ? f.departure.scheduled : f.arrival.scheduled;
            if (!timeStr) return false;
            const time = new Date(timeStr);
            return time > pastWindow && time < futureWindow;
        });

        console.log(`[API] After time filter: ${relevantFlights.length}`);

        // Map to simple interface
        const mappedFlights = relevantFlights.map((f: any) => ({
            flight: {
                iata: f.flight.iata,
                number: f.flight.number
            },
            airline: {
                name: f.airline.name,
                iata: f.airline.iata
            },
            status: f.flight_status,
            departure: {
                airport: f.departure.airport,
                iata: f.departure.iata,
                scheduled: f.departure.scheduled,
                terminal: f.departure.terminal,
                gate: f.departure.gate,
                delay: f.departure.delay,
                timezone: f.departure.timezone  // Capture timezone
            },
            arrival: {
                airport: f.arrival.airport,
                iata: f.arrival.iata,
                scheduled: f.arrival.scheduled,
                terminal: f.arrival.terminal,
                gate: f.arrival.gate,
                delay: f.arrival.delay,
                timezone: f.arrival.timezone // Capture timezone
            }
        }));

        // Deduplicate flights
        // Aggressive Strategy: Collapse codeshares.
        // If two flights have the same Scheduled Time AND Code/Remote, treat as same plane.

        const uniqueMap = new Map();
        mappedFlights.forEach((item: any) => {
            const time = type === 'departure' ? item.departure.scheduled : item.arrival.scheduled;
            // For departure board, uniqueness is Time + Destination. 
            // For arrival board, uniqueness is Time + Origin.
            const remote = type === 'departure' ? item.arrival.iata : item.departure.iata;
            const gate = type === 'departure' ? item.departure.gate : item.arrival.gate;

            // Primary Key: Time + Remote (+ Gate if exists to be safe)
            // This collapses AA123 and BA456 if they leave for LHR at 10:00
            const key = `${time}-${remote}-${gate || 'nogate'}`;

            if (!uniqueMap.has(key)) {
                uniqueMap.set(key, item);
            }
        });

        const dedupedFlights = Array.from(uniqueMap.values());
        console.log(`[API] After deduplication: ${dedupedFlights.length}`);

        // Sort by time
        dedupedFlights.sort((a: any, b: any) => {
            const timeA = new Date(type === 'departure' ? a.departure.scheduled : a.arrival.scheduled).getTime();
            const timeB = new Date(type === 'departure' ? b.departure.scheduled : b.arrival.scheduled).getTime();
            return timeA - timeB;
        });

        return NextResponse.json({
            flights: dedupedFlights,
            debug: {
                raw: data.data.length,
                filtered: relevantFlights.length,
                deduped: dedupedFlights.length,
                windowStart: pastWindow.toISOString(),
                windowEnd: futureWindow.toISOString()
            }
        });

    } catch (error) {
        console.error('Airport API error:', error);
        return NextResponse.json({ error: 'Failed to fetch airport data' }, { status: 500 });
    }
}
