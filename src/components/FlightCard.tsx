import React from 'react';
import { Plane, Clock, MapPin, Calendar } from 'lucide-react';

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

interface FlightCardProps {
    flight: Flight;
}

export function FlightCard({ flight }: FlightCardProps) {
    // Helper to extract local time parts from API string
    const getLocalTimeParts = (timeStr: string) => {
        // API returns local time but formatted with +00:00 (e.g., 21:30+00:00 for 9:30PM Local).
        // We must ignore the offset and treat it as the "face value" time at the airport.
        const cleanStr = timeStr.replace(/[Zz]|[+-]\d{2}:?\d{2}$/, '');
        return new Date(cleanStr);
    };

    const formatTime = (timeStr: string, timezone: string) => {
        try {
            // Create a date object that represents the standard LOCAL time components
            const date = getLocalTimeParts(timeStr);

            // Format "as is" - effectively treating the components as the intended display time
            const time = date.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
            });

            // For TZ abbreviation, we need the real absolute instant
            // But getting abbreviation is tricky if we don't assume the timeStr is absolute.
            // Let's rely on Intl for the abbreviation of the *intended* timezone
            const tz = new Intl.DateTimeFormat('en-US', {
                timeZoneName: 'short',
                timeZone: timezone
            }).formatToParts(new Date()).find(part => part.type === 'timeZoneName')?.value || '';

            return { time, tz };
        } catch (e) {
            return { time: timeStr, tz: '' };
        }
    };

    const formatDate = (timeStr: string) => {
        try {
            const date = getLocalTimeParts(timeStr);
            return date.toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
            });
        } catch (e) {
            return new Date(timeStr).toLocaleDateString();
        }
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

    // Helper to detect if landing is on a different calendar day (face value)
    const getDateDiff = (start: string, end: string) => {
        try {
            const startDate = getLocalTimeParts(start);
            const endDate = getLocalTimeParts(end);

            // Reset hours to compare only the dates
            startDate.setHours(0, 0, 0, 0);
            endDate.setHours(0, 0, 0, 0);

            const diffTime = endDate.getTime() - startDate.getTime();
            const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
            return diffDays;
        } catch (e) {
            return 0;
        }
    };

    // Helper to get aircraft image
    const getAircraftImage = (model: string | undefined) => {
        if (!model) return 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=2074&auto=format&fit=crop'; // Generic beautiful plane

        const m = model.toLowerCase();
        // Boeing
        if (m.includes('787')) return 'https://images.unsplash.com/photo-1542296332-2e44a991696e?q=80&w=2074&auto=format&fit=crop'; // 787
        if (m.includes('777')) return 'https://images.unsplash.com/photo-1569154941061-e231b4725ef1?q=80&w=2070&auto=format&fit=crop'; // 777
        if (m.includes('747')) return 'https://images.unsplash.com/photo-1540962351504-03099e0a754b?q=80&w=2070&auto=format&fit=crop'; // 747
        if (m.includes('737')) return 'https://images.unsplash.com/photo-1582030386708-46aa32d20352?q=80&w=2070&auto=format&fit=crop'; // 737

        // Airbus
        if (m.includes('a380')) return 'https://images.unsplash.com/photo-1559288210-907bcc8eb874?q=80&w=2070&auto=format&fit=crop'; // A380
        if (m.includes('a350')) return 'https://images.unsplash.com/photo-1610438250910-01cb769c1334?q=80&w=2070&auto=format&fit=crop'; // A350
        if (m.includes('a321') || m.includes('a320')) return 'https://images.unsplash.com/photo-1583321500900-82807e458f3c?q=80&w=2070&auto=format&fit=crop'; // A320 fam
        if (m.includes('a330')) return 'https://images.unsplash.com/photo-1596799002246-8dd3e571407f?q=80&w=2070&auto=format&fit=crop'; // A330

        // General fallback
        return 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=2074&auto=format&fit=crop';
    };

    const originTime = formatTime(flight.origin.time, flight.origin.timezone);
    const destTime = formatTime(flight.destination.time, flight.destination.timezone);
    const dateDiff = getDateDiff(flight.origin.time, flight.destination.time);
    const bgImage = getAircraftImage(flight.aircraft?.model);

    return (
        <div className="w-full relative overflow-hidden rounded-2xl shadow-xl my-4 group">
            {/* Background Image with Overlay */}
            <div className="absolute inset-0 z-0">
                <img
                    src={bgImage}
                    alt={flight.aircraft?.model || "Aircraft"}
                    className="w-full h-full object-cover opacity-40 group-hover:opacity-50 group-hover:scale-105 transition-all duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-br from-gray-900/90 via-gray-900/80 to-blue-900/80 backdrop-blur-[2px]" />
            </div>

            {/* Content Container */}
            <div className="relative z-10 p-6 text-white border border-white/10 rounded-2xl">
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-500/20 rounded-lg backdrop-blur-md">
                            <Plane className="w-5 h-5 text-blue-400" />
                        </div>
                        <div className="flex flex-col">
                            <span className="font-bold text-xl tracking-wider">{flight.flightNumber}</span>
                            {flight.aircraft?.model && flight.aircraft.model !== 'Unknown' && (
                                <span className="text-xs text-blue-300 font-medium">{flight.aircraft.model}</span>
                            )}
                        </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-md border border-white/10 ${flight.status === 'Active' ? 'bg-green-500/20 text-green-300' :
                        flight.status === 'Delayed' ? 'bg-red-500/20 text-red-300' :
                            'bg-blue-500/20 text-blue-300'
                        }`}>
                        {flight.status.toUpperCase()}
                    </span>
                </div>

                <div className="flex justify-between items-center relative">
                    {/* Origin */}
                    <div className="text-left w-1/3">
                        <div className="text-3xl font-bold mb-1">{flight.origin.code}</div>
                        <div className="text-sm text-gray-400 mb-2 truncate">{flight.origin.city.split('/')[0]}</div>
                        {(flight.origin.terminal || flight.origin.gate) && (
                            <div className="text-xs text-blue-200 mb-2 bg-blue-500/10 px-2 py-0.5 rounded-md inline-block border border-blue-500/20">
                                {flight.origin.terminal && `T${flight.origin.terminal}`}
                                {flight.origin.terminal && flight.origin.gate && <span className="mx-1">•</span>}
                                {flight.origin.gate && `G${flight.origin.gate}`}
                            </div>
                        )}
                        <div className="flex flex-col">
                            <div className="text-3xl font-bold text-white">
                                {originTime.time}
                            </div>
                            <div className="text-sm font-medium text-blue-400">{originTime.tz}</div>
                        </div>
                    </div>

                    {/* Flight Path Visual */}
                    <div className="flex-1 px-4 flex flex-col items-center">
                        <div className="text-gray-400 text-sm font-medium mb-2">{getDuration(flight.origin.time, flight.destination.time, flight.origin.timezone, flight.destination.timezone)}</div>
                        <div className="relative w-full flex items-center justify-center">
                            <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full" />
                            <div className="w-full h-[2px] bg-gradient-to-r from-transparent via-blue-500 to-transparent relative">
                                <Plane className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-5 text-blue-400 fill-blue-400/20 rotate-90" />
                            </div>
                        </div>
                    </div>

                    {/* Destination */}
                    <div className="text-right w-1/3">
                        <div className="text-3xl font-bold mb-1">{flight.destination.code}</div>
                        <div className="text-sm text-gray-400 mb-2 truncate">{flight.destination.city.split('/')[0]}</div>
                        {(flight.destination.terminal || flight.destination.gate) && (
                            <div className="text-xs text-blue-200 mb-2 bg-blue-500/10 px-2 py-0.5 rounded-md inline-block border border-blue-500/20">
                                {flight.destination.terminal && `T${flight.destination.terminal}`}
                                {flight.destination.terminal && flight.destination.gate && <span className="mx-1">•</span>}
                                {flight.destination.gate && `G${flight.destination.gate}`}
                            </div>
                        )}
                        <div className="flex flex-col items-end">
                            <div className="flex items-baseline gap-1">
                                <div className="text-3xl font-bold text-white">
                                    {destTime.time}
                                </div>
                                {dateDiff > 0 && (
                                    <span className="text-sm font-bold text-purple-400 bg-purple-500/10 px-1.5 py-0.5 rounded border border-purple-500/20">
                                        +{dateDiff}
                                    </span>
                                )}
                            </div>
                            <div className="text-sm font-medium text-purple-400">{destTime.tz}</div>
                        </div>
                    </div>
                </div>

                <div className="mt-6 pt-4 border-t border-white/10 flex justify-between text-sm text-gray-400">
                    <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {formatDate(flight.origin.time)}
                    </div>
                    <div>
                        {flight.origin.timezone} → {flight.destination.timezone}
                    </div>
                </div>

                {/* Telemetry Section */}
                {flight.live && (
                    <div className="mt-4 pt-4 border-t border-white/10 grid grid-cols-2 gap-4">
                        <div className="bg-black/20 rounded-lg p-3 text-center border border-white/5 backdrop-blur-sm">
                            <div className="text-gray-400 text-xs uppercase tracking-wider mb-1">Altitude</div>
                            <div className="text-xl font-mono font-bold text-blue-300">
                                {Math.round(flight.live.altitude).toLocaleString()} <span className="text-sm font-normal text-gray-500">ft</span>
                            </div>
                        </div>
                        <div className="bg-black/20 rounded-lg p-3 text-center border border-white/5 backdrop-blur-sm">
                            <div className="text-gray-400 text-xs uppercase tracking-wider mb-1">Ground Speed</div>
                            <div className="text-xl font-mono font-bold text-blue-300">
                                {Math.round(flight.live.speed_horizontal).toLocaleString()} <span className="text-sm font-normal text-gray-500">km/h</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
