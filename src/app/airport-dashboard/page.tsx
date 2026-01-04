"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowLeft, Search, Plane, Calendar } from "lucide-react";

interface AirportFlight {
    flight: { iata: string; number: string };
    airline: { name: string; iata: string };
    status: string;
    departure: { scheduled: string; terminal: string; gate: string; delay: number; iata: string; airport: string; timezone?: string };
    arrival: { scheduled: string; terminal: string; gate: string; delay: number; iata: string; airport: string; timezone?: string };
}

export default function AirportDashboard() {
    const [selectedDate, setSelectedDate] = useState("");
    const [airportCode, setAirportCode] = useState("");
    const [searchedCode, setSearchedCode] = useState("");
    const [mode, setMode] = useState<'departure' | 'arrival'>('departure');
    const [flights, setFlights] = useState<AirportFlight[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchFlights = async (code: string, type: 'departure' | 'arrival', date?: string) => {
        if (!code) return;
        setLoading(true);
        try {
            let url = `/api/airports?code=${code}&type=${type}`;
            if (date) url += `&date=${date}`;
            const res = await fetch(url);
            const data = await res.json();
            if (data.flights) {
                setFlights(data.flights);
                setSearchedCode(code);
            } else {
                setFlights([]);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const dateInputRef = useRef<HTMLInputElement>(null);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        fetchFlights(airportCode, mode, selectedDate);
    };

    const triggerDatePicker = () => {
        if (dateInputRef.current) {
            // Modern browsers support showPicker()
            if ('showPicker' in HTMLInputElement.prototype) {
                try {
                    dateInputRef.current.showPicker();
                } catch (e) {
                    dateInputRef.current.click();
                }
            } else {
                dateInputRef.current.click();
            }
        }
    };

    // Auto-refresh when tabs switch if we have a code
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => {
        if (searchedCode) {
            fetchFlights(searchedCode, mode, selectedDate);
        }
    }, [mode, selectedDate]);

    const formatTime = (timeStr: string) => {
        const cleanStr = timeStr.replace(/[Zz]|[+-]\d{2}:?\d{2}$/, '');
        const date = new Date(cleanStr);
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    };

    const formatDate = (timeStr: string) => {
        const cleanStr = timeStr.replace(/[Zz]|[+-]\d{2}:?\d{2}$/, '');
        const date = new Date(cleanStr);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', weekday: 'short' });
    };

    return (
        <main className="min-h-screen bg-gray-900 text-white p-4 sm:p-12 relative overflow-hidden">
            {/* Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
                <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[100px]" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-600/20 rounded-full blur-[100px]" />
            </div>

            {/* Header */}
            <div className="max-w-6xl mx-auto flex flex-col gap-8">
                <div className="flex items-center gap-4">
                    <Link href="/" className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-colors backdrop-blur-md">
                        <ArrowLeft className="w-6 h-6" />
                    </Link>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
                        Airport Dashboard
                    </h1>
                </div>

                {/* Search & Controls */}
                <div className="flex flex-col md:flex-row gap-6 items-center justify-between bg-white/5 p-6 rounded-2xl border border-white/10 backdrop-blur-md shadow-xl">
                    <form onSubmit={handleSearch} className="relative w-full md:w-96 flex gap-2">
                        <input
                            type="text"
                            value={airportCode}
                            onChange={(e) => setAirportCode(e.target.value.toUpperCase())}
                            placeholder="JFK"
                            className="w-1/2 bg-white/10 border border-white/20 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 focus:bg-white/20 transition-all text-white scheme-dark placeholder-gray-400"
                            maxLength={4}
                        />
                        <div
                            className="relative w-1/2 group cursor-pointer"
                            onClick={triggerDatePicker}
                        >
                            <div className="bg-white/10 border border-white/20 rounded-xl px-4 py-3 flex items-center justify-between group-focus-within:border-blue-500 group-focus-within:bg-white/20 transition-all hover:bg-white/20 hover:border-white/40 shadow-lg">
                                <span className={`font-medium ${selectedDate ? 'text-white' : 'text-gray-400'}`}>
                                    {selectedDate ? new Date(selectedDate + 'T12:00:00').toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: '2-digit',
                                        day: '2-digit'
                                    }) : 'Select Date'}
                                </span>
                                <Calendar className="w-5 h-5 text-blue-400" />
                            </div>
                            <input
                                ref={dateInputRef}
                                type="date"
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                className="absolute inset-0 w-full h-full opacity-0 pointer-events-none"
                            />
                        </div>
                        <button type="submit" className="p-3 bg-blue-500/80 hover:bg-blue-500 rounded-xl transition-colors">
                            <Search className="w-5 h-5 text-white" />
                        </button>
                    </form>

                    <div className="flex bg-black/20 p-1 rounded-xl border border-white/5">
                        <button
                            onClick={() => setMode('departure')}
                            className={`flex items-center gap-2 px-6 py-2 rounded-lg font-medium transition-all ${mode === 'departure' ? 'bg-blue-500 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                        >
                            <Plane className="w-4 h-4 -rotate-45" />
                            Departures
                        </button>
                        <button
                            onClick={() => setMode('arrival')}
                            className={`flex items-center gap-2 px-6 py-2 rounded-lg font-medium transition-all ${mode === 'arrival' ? 'bg-purple-500 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                        >
                            <Plane className="w-4 h-4 rotate-135" />
                            Arrivals
                        </button>
                    </div>
                </div>

                {selectedDate && new Date(selectedDate + 'T00:00:00') > new Date(new Date().setHours(0, 0, 0, 0)) && (
                    <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 flex items-start gap-4 backdrop-blur-md animate-in fade-in slide-in-from-top-2 duration-300">
                        <div className="p-2 bg-amber-500/20 rounded-lg">
                            <Calendar className="w-5 h-5 text-amber-500" />
                        </div>
                        <div>
                            <h3 className="text-amber-400 font-bold mb-1">API Limitation: Future Dates</h3>
                            <p className="text-amber-200/80 text-sm leading-relaxed">
                                The free tier API primarily provides live and near-live data. Flight schedules for future dates might be incomplete or unavailable.
                            </p>
                        </div>
                    </div>
                )}

                {/* Flight Board */}
                {searchedCode && (
                    <div className="bg-black/30 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
                        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
                            <h2 className="text-2xl font-bold tracking-tight">
                                {mode === 'departure' ? 'Departures' : 'Arrivals'}
                                <span className="text-gray-500 ml-2 font-normal text-lg">at {searchedCode}</span>
                            </h2>
                            <div className="text-sm text-gray-400 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                                Live Data
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-black/20 text-gray-400 text-sm uppercase tracking-wider">
                                    <tr>
                                        <th className="p-4 font-medium">Date</th>
                                        <th className="p-4 font-medium">Time</th>
                                        <th className="p-4 font-medium">Flight</th>
                                        <th className="p-4 font-medium">Airline</th>
                                        <th className="p-4 font-medium">{mode === 'departure' ? 'Destination' : 'Origin'}</th>
                                        <th className="p-4 font-medium">Gate</th>
                                        <th className="p-4 font-medium text-right">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5 text-sm">
                                    {loading ? (
                                        <tr>
                                            <td colSpan={7} className="p-8 text-center text-gray-500 animate-pulse">Loading Flight Board...</td>
                                        </tr>
                                    ) : flights.length > 0 ? (
                                        flights.map((flight, i) => (
                                            <tr key={i} className="hover:bg-white/5 transition-colors group">
                                                <td className="p-4 text-gray-400">
                                                    <div className="flex flex-col">
                                                        <span>{formatDate(mode === 'departure' ? flight.departure.scheduled : flight.arrival.scheduled)}</span>
                                                        <span className="text-xs text-blue-400/70">
                                                            {(mode === 'departure' ? flight.departure.timezone : flight.arrival.timezone) || 'Local Time'}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="p-4 font-mono text-blue-300 font-bold">
                                                    {formatTime(mode === 'departure' ? flight.departure.scheduled : flight.arrival.scheduled)}
                                                </td>
                                                <td className="p-4 font-bold text-white">{flight.flight.iata}</td>
                                                <td className="p-4 text-gray-300">{flight.airline.name}</td>
                                                <td className="p-4 text-gray-300">
                                                    <div className="flex flex-col">
                                                        <span className="text-white font-bold">
                                                            {mode === 'departure' ? flight.arrival.iata : flight.departure.iata}
                                                        </span>
                                                        <span className="text-xs text-gray-500 truncate max-w-[150px]">
                                                            {mode === 'departure' ? flight.arrival.airport : flight.departure.airport}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="p-4 font-mono text-yellow-500">
                                                    {(mode === 'departure' ? flight.departure.gate : flight.arrival.gate) || '-'}
                                                </td>
                                                <td className="p-4 text-right">
                                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${flight.status === 'active' || flight.status === 'landed' ? 'bg-green-500/20 text-green-400' :
                                                        flight.status === 'scheduled' ? 'bg-blue-500/20 text-blue-400' :
                                                            'bg-gray-500/20 text-gray-400'
                                                        }`}>
                                                        {flight.status ? flight.status.toUpperCase() : 'UNKNOWN'}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={7} className="p-12 text-center text-gray-500">
                                                No flights found for this time window.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>


        </main >
    );
}
