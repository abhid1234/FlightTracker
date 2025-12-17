import { NextResponse } from 'next/server';

interface Flight {
    flightNumber: string;
    origin: {
        code: string;
        city: string;
        time: string; // ISO string
        timezone: string;
    };
    destination: {
        code: string;
        city: string;
        time: string; // ISO string
        timezone: string;
    };
    status: string;
}

const MOCK_FLIGHTS: Flight[] = [
    {
        flightNumber: 'AA123',
        origin: {
            code: 'JFK',
            city: 'New York',
            time: '2024-05-20T10:00:00Z',
            timezone: 'America/New_York',
        },
        destination: {
            code: 'LHR',
            city: 'London',
            time: '2024-05-20T22:00:00Z',
            timezone: 'Europe/London',
        },
        status: 'On Time',
    },
    {
        flightNumber: 'BA456',
        origin: {
            code: 'LHR',
            city: 'London',
            time: '2024-05-21T14:00:00Z',
            timezone: 'Europe/London',
        },
        destination: {
            code: 'JFK',
            city: 'New York',
            time: '2024-05-21T17:00:00Z',
            timezone: 'America/New_York',
        },
        status: 'Delayed',
    },
    {
        flightNumber: 'UA789',
        origin: {
            code: 'SFO',
            city: 'San Francisco',
            time: '2024-05-22T08:00:00Z',
            timezone: 'America/Los_Angeles',
        },
        destination: {
            code: 'HND',
            city: 'Tokyo',
            time: '2024-05-23T11:00:00Z',
            timezone: 'Asia/Tokyo',
        },
        status: 'Scheduled',
    },
    {
        flightNumber: 'AS718',
        origin: {
            code: 'SEA',
            city: 'Seattle',
            time: '2024-05-24T09:00:00Z',
            timezone: 'America/Los_Angeles',
        },
        destination: {
            code: 'DCA',
            city: 'Washington DC',
            time: '2024-05-24T17:15:00Z',
            timezone: 'America/New_York',
        },
        status: 'On Time',
    },
];

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');

    if (!query) {
        return NextResponse.json(MOCK_FLIGHTS);
    }

    const filteredFlights = MOCK_FLIGHTS.filter((flight) =>
        flight.flightNumber.toLowerCase().includes(query.toLowerCase())
    );

    return NextResponse.json(filteredFlights);
}
