import React from 'react';
import { Plane, Clock, MapPin, Calendar } from 'lucide-react';

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

interface FlightCardProps {
    flight: Flight;
}

export function FlightCard({ flight }: FlightCardProps) {
    const formatTime = (timeStr: string, timezone: string) => {
        try {
            return new Date(timeStr).toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                timeZone: timezone,
            });
        } catch (e) {
            return timeStr;
        }
    };

    const formatDate = (timeStr: string) => {
        return new Date(timeStr).toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
        });
    };

    return (
        <div className="w-full max-w-md bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 shadow-xl text-white my-4 hover:bg-white/15 transition-all duration-300">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2">
                    <Plane className="w-5 h-5 text-blue-400" />
                    <span className="font-bold text-xl tracking-wider">{flight.flightNumber}</span>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${flight.status === 'On Time' ? 'bg-green-500/20 text-green-300' :
                        flight.status === 'Delayed' ? 'bg-red-500/20 text-red-300' :
                            'bg-blue-500/20 text-blue-300'
                    }`}>
                    {flight.status}
                </span>
            </div>

            <div className="flex justify-between items-center relative">
                {/* Origin */}
                <div className="text-left">
                    <div className="text-3xl font-bold mb-1">{flight.origin.code}</div>
                    <div className="text-sm text-gray-400 mb-2">{flight.origin.city}</div>
                    <div className="flex items-center gap-1 text-sm text-blue-300">
                        <Clock className="w-3 h-3" />
                        {formatTime(flight.origin.time, flight.origin.timezone)}
                    </div>
                </div>

                {/* Flight Path Visual */}
                <div className="flex-1 px-4 flex flex-col items-center">
                    <div className="w-full h-[2px] bg-gray-600 relative top-3">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gray-900 p-1 rounded-full">
                            <Plane className="w-4 h-4 text-gray-400 rotate-90" />
                        </div>
                    </div>
                    <div className="mt-6 text-xs text-gray-500">Duration: 7h 30m</div>
                </div>

                {/* Destination */}
                <div className="text-right">
                    <div className="text-3xl font-bold mb-1">{flight.destination.code}</div>
                    <div className="text-sm text-gray-400 mb-2">{flight.destination.city}</div>
                    <div className="flex items-center gap-1 justify-end text-sm text-blue-300">
                        <Clock className="w-3 h-3" />
                        {formatTime(flight.destination.time, flight.destination.timezone)}
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
        </div>
    );
}
