"use client";

import { useState } from "react";
import { Search, Plane } from "lucide-react";
import { FlightCard } from "@/components/FlightCard";

interface Flight {
    flightNumber: string;
    origin: {
        code: string;
        city: string;
        time: string;
        timezone: string;
    };
    destination: {
        code: string;
        city: string;
        time: string;
        timezone: string;
    };
    status: string;
}

export default function Home() {
    const [query, setQuery] = useState("");
    const [flights, setFlights] = useState<Flight[]>([]);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim()) return;

        setLoading(true);
        setSearched(true);
        try {
            const res = await fetch(`/api/flights?query=${encodeURIComponent(query)}`);
            const data = await res.json();
            setFlights(data);
        } catch (error) {
            console.error("Failed to fetch flights", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen bg-gray-900 text-white flex flex-col items-center p-4 sm:p-24 relative overflow-hidden">
            {/* Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[100px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/20 rounded-full blur-[100px]" />
            </div>

            <div className="z-10 w-full max-w-3xl flex flex-col items-center">
                <div className="mb-12 text-center">
                    <div className="flex items-center justify-center gap-3 mb-4">
                        <div className="p-3 bg-blue-500/20 rounded-xl backdrop-blur-sm border border-blue-500/30">
                            <Plane className="w-8 h-8 text-blue-400" />
                        </div>
                    </div>
                    <h1 className="text-4xl sm:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400 mb-4">
                        Flight Tracker
                    </h1>
                    <p className="text-gray-400 text-lg">
                        Real-time flight status and details at your fingertips
                    </p>
                </div>

                <form onSubmit={handleSearch} className="w-full max-w-xl mb-12 relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-500" />
                    <div className="relative flex items-center bg-gray-800/50 backdrop-blur-xl border border-white/10 rounded-2xl p-2 shadow-2xl">
                        <Search className="w-6 h-6 text-gray-400 ml-4" />
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Enter flight number (e.g., AA123)"
                            className="w-full bg-transparent border-none outline-none text-white px-4 py-3 text-lg placeholder-gray-500"
                        />
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? "Searching..." : "Search"}
                        </button>
                    </div>
                </form>

                <div className="w-full flex flex-col items-center gap-6">
                    {loading ? (
                        <div className="text-gray-400 animate-pulse">Locating flights...</div>
                    ) : flights.length > 0 ? (
                        flights.map((flight) => (
                            <FlightCard key={flight.flightNumber} flight={flight} />
                        ))
                    ) : searched ? (
                        <div className="text-gray-500 text-center p-8 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm">
                            <p className="text-xl font-semibold mb-2">No flights found</p>
                            <p className="text-sm">Try searching for "AA123", "BA456", or "UA789"</p>
                        </div>
                    ) : null}
                </div>
            </div>
        </main>
    );
}
