"use client";

import { useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { FlightCard } from "@/components/FlightCard";
import dynamic from "next/dynamic";
import Image from "next/image";
import { AutocompleteInput } from "@/components/AutocompleteInput";
import { MOCK_FLIGHTS } from "@/lib/airlines";
import logoImg from "@/assets/logo.png";

const FlightMap = dynamic(() => import("@/components/FlightMap"), {
    ssr: false,
    loading: () => <div className="w-full h-96 bg-gray-800/50 rounded-xl animate-pulse" />,
});

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

export default function Home() {
    const [query, setQuery] = useState("");
    const [flightData, setFlightData] = useState<{
        current: Flight | null;
        past: Flight[];
        upcoming: Flight[];
    } | null>(null);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim()) return;

        setLoading(true);
        setSearched(true);
        try {
            const sanitizedQuery = query.replace(/\s+/g, '');
            let url = `/api/flights?query=${encodeURIComponent(sanitizedQuery)}`;
            const res = await fetch(url);
            const data = await res.json();
            setFlightData(data);
        } catch (error) {
            console.error("Failed to fetch flights", error);
        } finally {
            setLoading(false);
        }
    };

    const handleFlightSelect = (flight: Flight) => {
        setFlightData(prev => prev ? { ...prev, current: flight } : null);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Helper to extract local time parts from API string
    const getLocalTimeParts = (timeStr: string) => {
        const cleanStr = timeStr.replace(/[Zz]|[+-]\d{2}:?\d{2}$/, '');
        return new Date(cleanStr);
    };

    // Helper to get timezone offset in milliseconds
    const getTimezoneOffset = (timeZone: string) => {
        try {
            const now = new Date();
            const utcDate = new Date(now.toLocaleString('en-US', { timeZone: 'UTC' }));
            const tzDate = new Date(now.toLocaleString('en-US', { timeZone }));
            return tzDate.getTime() - utcDate.getTime();
        } catch (e) {
            return 0;
        }
    };

    // Helper to calculate duration with timezone adjustment
    const getDuration = (start: string, end: string, originZone: string, destZone: string) => {
        const startDate = new Date(start);
        const endDate = new Date(end);

        // Naive difference (face value difference)
        const faceDiff = endDate.getTime() - startDate.getTime();

        // Calculate offsets
        const originOffset = getTimezoneOffset(originZone);
        const destOffset = getTimezoneOffset(destZone);

        // True duration
        const trueDurationMs = faceDiff - (destOffset - originOffset);

        const hours = Math.floor(trueDurationMs / (1000 * 60 * 60));
        const minutes = Math.floor((trueDurationMs % (1000 * 60 * 60)) / (1000 * 60));
        return `${hours}h ${minutes}m`;
    };

    // Helper to format time "as is"
    const formatTimeWithZone = (timeStr: string) => {
        try {
            const date = getLocalTimeParts(timeStr);
            return date.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
            });
        } catch (e) {
            return timeStr;
        }
    };

    const formatDateWithZone = (timeStr: string, options: Intl.DateTimeFormatOptions) => {
        try {
            const date = getLocalTimeParts(timeStr);
            return date.toLocaleDateString('en-US', options);
        } catch (e) {
            return timeStr;
        }
    };

    const autocompleteOptions = [
        ...MOCK_FLIGHTS.map(f => ({ value: f.code, label: f.label })),
    ];

    return (
        <main className="min-h-screen bg-gray-900 text-white flex flex-col items-center p-4 sm:p-24 relative overflow-hidden">
            {/* Logo in upper left corner */}
            <div className="absolute top-4 left-4 sm:top-8 sm:left-8 z-20">
                <div className="p-2 sm:p-4 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl backdrop-blur-md border border-white/10 shadow-2xl hover:border-white/20 transition-all duration-300">
                    <Image
                        src={logoImg}
                        alt="Flight Tracker Logo"
                        width={511}
                        height={595}
                        className="w-10 h-auto sm:w-16 hover:scale-105 transition-transform duration-300"
                        placeholder="blur"
                    />
                </div>
            </div>

            {/* Top Right Navigation */}
            <div className="absolute top-4 right-4 sm:top-8 sm:right-8 z-20 flex gap-2 sm:gap-4">
                <Link
                    href="/airport-dashboard"
                    className="px-3 py-2 text-xs sm:text-base sm:px-5 sm:py-3 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/10 rounded-xl text-white font-medium transition-all duration-300 hover:scale-105 shadow-lg text-center"
                >
                    Airport Dashboard
                </Link>
                <Link
                    href="/architecture"
                    className="px-3 py-2 text-xs sm:text-base sm:px-6 sm:py-3 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/10 rounded-xl text-white font-medium transition-all duration-300 hover:scale-105 shadow-lg text-center"
                >
                    Architecture
                </Link>
            </div>

            {/* Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[100px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/20 rounded-full blur-[100px]" />
            </div>

            <div className="z-10 w-full max-w-3xl flex flex-col items-center mt-20 sm:mt-0">
                <div className="mb-12 text-center">
                    <h1 className="text-4xl sm:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400 mb-4 pb-2">
                        Flight Tracker
                    </h1>
                    <p className="text-gray-400 text-lg">
                        Real-time flight status and details at your fingertips
                    </p>
                </div>

                <form onSubmit={handleSearch} className="w-full max-w-xl mb-12 relative group z-50">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-500" />
                    <div className="relative flex flex-col sm:flex-row items-center bg-gray-800/50 backdrop-blur-xl border border-white/10 rounded-2xl p-2 shadow-2xl gap-2">
                        <div className="flex-1 w-full">
                            <AutocompleteInput
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                onSelect={(val) => setQuery(val)}
                                options={autocompleteOptions}
                                placeholder="Flight # (e.g., AA100)"
                                containerClassName="!static"
                                inputClassName="text-white px-2 py-3 text-lg placeholder-gray-500"
                                startIcon={<Search className="w-6 h-6 text-gray-400 ml-4" />}
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                        >
                            {loading ? "Searching..." : "Search"}
                        </button>
                    </div>
                </form>

                <div className="w-full flex flex-col items-center gap-6">
                    {loading ? (
                        <div className="text-gray-400 animate-pulse">Locating flights...</div>
                    ) : flightData?.current ? (
                        <>
                            {/* Main Active Flight */}
                            <div className="w-full flex flex-col gap-6">
                                <FlightCard flight={flightData.current} />
                                <FlightMap
                                    origin={flightData.current.origin}
                                    destination={flightData.current.destination}
                                    livePosition={flightData.current.live ? {
                                        lat: flightData.current.live.latitude,
                                        lng: flightData.current.live.longitude,
                                        direction: flightData.current.live.direction
                                    } : undefined}
                                />
                            </div>

                            {/* Upcoming Flights */}
                            {flightData.upcoming.length > 0 && (
                                <div className="w-full max-w-3xl mt-8">
                                    <h3 className="text-xl font-semibold mb-4 text-blue-300">Upcoming Flights</h3>
                                    <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl overflow-hidden">
                                        <table className="w-full text-left text-sm text-gray-300">
                                            <thead className="bg-white/5 text-gray-400">
                                                <tr>
                                                    <th className="p-4 font-medium">Date</th>
                                                    <th className="p-4 font-medium">Origin</th>
                                                    <th className="p-4 font-medium">Destination</th>
                                                    <th className="p-4 font-medium">Status</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-white/10">
                                                {flightData.upcoming.map((flight, i) => (
                                                    <tr
                                                        key={i}
                                                        onClick={() => handleFlightSelect(flight)}
                                                        className="hover:bg-white/10 transition-colors cursor-pointer"
                                                    >
                                                        <td className="p-4">
                                                            <div className="flex flex-col">
                                                                <span className="font-medium text-white">
                                                                    {formatDateWithZone(flight.origin.time, { weekday: 'long' })}
                                                                </span>
                                                                <span className="text-gray-400 text-xs">
                                                                    {formatDateWithZone(flight.origin.time, { month: 'short', day: 'numeric' })}
                                                                </span>
                                                            </div>
                                                        </td>
                                                        <td className="p-4">{flight.origin.code}</td>
                                                        <td className="p-4">{flight.destination.code}</td>
                                                        <td className="p-4">
                                                            <span className="px-2 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300">
                                                                {flight.status}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {/* Past Flights */}
                            {flightData.past.length > 0 && (
                                <div className="w-full max-w-3xl mt-8 mb-12">
                                    <h3 className="text-xl font-semibold mb-4 text-gray-400">Past Flights</h3>
                                    <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl overflow-hidden">
                                        <table className="w-full text-left text-sm text-gray-400">
                                            <thead className="bg-white/5 text-gray-500">
                                                <tr>
                                                    <th className="p-4 font-medium">Date</th>
                                                    <th className="p-4 font-medium">Aircraft</th>
                                                    <th className="p-4 font-medium">Origin</th>
                                                    <th className="p-4 font-medium">Destination</th>
                                                    <th className="p-4 font-medium">Departure</th>
                                                    <th className="p-4 font-medium">Arrival</th>
                                                    <th className="p-4 font-medium">Duration</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-white/10">
                                                {flightData.past.map((flight, i) => (
                                                    <tr
                                                        key={i}
                                                        onClick={() => handleFlightSelect(flight)}
                                                        className="hover:bg-white/10 transition-colors cursor-pointer"
                                                    >
                                                        <td className="p-4">
                                                            <div className="flex flex-col">
                                                                <span className="font-medium text-white">
                                                                    {formatDateWithZone(flight.origin.time, { weekday: 'long' })}
                                                                </span>
                                                                <span className="text-gray-400 text-xs">
                                                                    {formatDateWithZone(flight.origin.time, { month: 'short', day: 'numeric' })}
                                                                </span>
                                                            </div>
                                                        </td>
                                                        <td className="p-4 text-gray-300">
                                                            {flight.aircraft?.model || '-'}
                                                        </td>
                                                        <td className="p-4">
                                                            <span className="text-blue-400 group-hover:text-blue-300">{flight.origin.code}</span>
                                                        </td>
                                                        <td className="p-4">
                                                            <span className="text-blue-400 group-hover:text-blue-300">{flight.destination.code}</span>
                                                        </td>
                                                        <td className="p-4">
                                                            {formatTimeWithZone(flight.origin.time)}
                                                        </td>
                                                        <td className="p-4">
                                                            {formatTimeWithZone(flight.destination.time)}
                                                        </td>
                                                        <td className="p-4 font-mono text-xs opacity-70">
                                                            {getDuration(flight.origin.time, flight.destination.time, flight.origin.timezone, flight.destination.timezone)}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </>
                    ) : searched ? (
                        <div className="text-gray-500 text-center p-8 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm">
                            <p className="text-xl font-semibold mb-2">No flights found</p>
                            <p className="text-sm">Try searching for &quot;AA100&quot;, &quot;BA456&quot;, or &quot;UA789&quot;</p>
                        </div>
                    ) : null}
                </div>
            </div>
        </main>
    );
}