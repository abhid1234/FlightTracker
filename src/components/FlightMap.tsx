'use client';

import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useEffect } from 'react';

// Fix for default marker icons in Next.js
const iconUrl = 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png';
const iconRetinaUrl = 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png';
const shadowUrl = 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png';

const defaultIcon = L.icon({
    iconUrl,
    iconRetinaUrl,
    shadowUrl,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
});

L.Marker.prototype.options.icon = defaultIcon;

interface FlightMapProps {
    origin: {
        code: string;
        city: string;
        lat?: number;
        lng?: number;
    };
    destination: {
        code: string;
        city: string;
        lat?: number;
        lng?: number;
    };
    livePosition?: {
        lat: number;
        lng: number;
        direction: number;
    };
}

import { AIRPORT_COORDS } from '@/lib/airports';

function MapController({ bounds }: { bounds: L.LatLngBoundsExpression }) {
    const map = useMap();
    useEffect(() => {
        map.fitBounds(bounds, { padding: [50, 50] });
    }, [map, bounds]);
    return null;
}

export default function FlightMap({ origin, destination, livePosition }: FlightMapProps) {
    const originCoords = AIRPORT_COORDS[origin.code] || AIRPORT_COORDS.DEFAULT;
    const destCoords = AIRPORT_COORDS[destination.code] || AIRPORT_COORDS.DEFAULT;

    // If we don't have coords, don't render map or render a placeholder
    if (originCoords === AIRPORT_COORDS.DEFAULT || destCoords === AIRPORT_COORDS.DEFAULT) {
        return (
            <div className="w-full h-64 bg-gray-800/50 rounded-lg flex items-center justify-center text-gray-400 border border-white/10">
                Map data not available for {origin.code} or {destination.code}
            </div>
        );
    }

    return (
        <div className="w-full h-96 rounded-xl overflow-hidden shadow-lg border border-white/20 mt-6 z-0 relative">
            <MapContainer
                center={[
                    (originCoords[0] + destCoords[0]) / 2,
                    (originCoords[1] + destCoords[1]) / 2,
                ]}
                zoom={2}
                scrollWheelZoom={false}
                style={{ height: '100%', width: '100%' }}
            >
                <MapController bounds={[originCoords, destCoords]} />
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <Marker position={originCoords}>
                    <Popup>
                        {origin.city} ({origin.code})
                    </Popup>
                </Marker>

                <Marker position={destCoords}>
                    <Popup>
                        {destination.city} ({destination.code})
                    </Popup>
                </Marker>

                {livePosition && (
                    <Marker
                        position={[livePosition.lat, livePosition.lng]}
                        icon={L.icon({
                            iconUrl: 'https://cdn-icons-png.flaticon.com/512/7893/7893979.png', // Plane icon
                            iconSize: [32, 32],
                            iconAnchor: [16, 16],
                            className: `rotate-[${livePosition.direction}deg]`
                        })}
                    >
                        <Popup>
                            Current Position
                        </Popup>
                    </Marker>
                )}

                <Polyline
                    positions={[originCoords, destCoords]}
                    color="#3b82f6"
                    weight={4}
                    opacity={0.7}
                    dashArray="10, 10"
                />
            </MapContainer>
        </div>
    );
}
