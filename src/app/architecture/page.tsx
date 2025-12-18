"use client";

import Script from "next/script";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, Server, Database, Globe } from "lucide-react";

export default function ArchitecturePage() {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    return (
        <main className="min-h-screen bg-gray-900 text-white p-4 sm:p-24 relative overflow-hidden">
            <Script
                src="https://cdn.jsdelivr.net/npm/mermaid/dist/mermaid.min.js"
                strategy="afterInteractive"
                onLoad={() => {
                    // @ts-ignore
                    window.mermaid.initialize({ startOnLoad: true });
                    // @ts-ignore
                    window.mermaid.contentLoaded();
                }}
            />

            {/* Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[100px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/20 rounded-full blur-[100px]" />
            </div>

            <div className="max-w-4xl mx-auto z-10">
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors mb-8 group"
                >
                    <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                    Back to Flight Tracker
                </Link>

                <h1 className="text-4xl sm:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400 mb-6">
                    System Architecture
                </h1>

                <p className="text-xl text-gray-300 mb-12">
                    Technical overview of the Flight Tracker application structure and data flow.
                </p>

                {/* Architecture Details */}
                <div className="grid gap-8 mb-12">
                    <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="p-3 bg-blue-500/20 rounded-xl">
                                <Globe className="w-8 h-8 text-blue-400" />
                            </div>
                            <h2 className="text-2xl font-semibold">Frontend Layer</h2>
                        </div>
                        <p className="text-gray-400 leading-relaxed mb-4">
                            <strong>Framework:</strong> Next.js 14 (App Router)<br />
                            <strong>UI Library:</strong> React 18 with Tailwind CSS<br />
                            <strong>Maps:</strong> React Leaflet integration
                        </p>
                        <p className="text-gray-400 leading-relaxed">
                            The frontend is a responsive client-side application that handles user interactions,
                            displays real-time flight data using FlightCard components, and visualizes routes on an interactive map.
                        </p>
                    </div>

                    <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="p-3 bg-purple-500/20 rounded-xl">
                                <Server className="w-8 h-8 text-purple-400" />
                            </div>
                            <h2 className="text-2xl font-semibold">Cloud Infrastructure</h2>
                        </div>
                        <p className="text-gray-400 leading-relaxed mb-4">
                            <strong>Hosting:</strong> Google Cloud Run (Serverless)<br />
                            <strong>Domain:</strong> GoDaddy (DNS Management)<br />
                            <strong>Routing:</strong> Custom domain pointing to Cloud Run service
                        </p>
                        <p className="text-gray-400 leading-relaxed">
                            The application runs in a serverless container environment on Google Cloud Platform,
                            ensuring automatic scaling and high availability.
                        </p>
                    </div>

                    <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="p-3 bg-green-500/20 rounded-xl">
                                <Database className="w-8 h-8 text-green-400" />
                            </div>
                            <h2 className="text-2xl font-semibold">Data Flow & API</h2>
                        </div>
                        <div className="text-gray-400 leading-relaxed">
                            <p className="mb-4"><strong>External Service:</strong> Aviationstack API</p>
                            <ul className="list-disc list-inside space-y-2 ml-4">
                                <li>User initiates search request from Browser Client</li>
                                <li>Request routed via HTTPS/DNS to Cloud Run</li>
                                <li>Next.js API Route (<code>/api/flights</code>) acts as a proxy</li>
                                <li>Server fetches real-time data from Aviationstack</li>
                                <li>Response is normalized and sent back to the UI</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Architecture Diagram */}
                <div className="mt-12 mb-12 flex justify-center">
                    <div className="w-full max-w-[80%]">
                        <h2 className="text-2xl font-semibold mb-6 text-left">System Diagram</h2>
                        <div className="bg-white p-6 rounded-xl overflow-hidden shadow-2xl">
                            <div className="mermaid flex justify-center">
                                {`graph TB
    %% CONFIG
    %%{init: {'theme': 'base', 'themeVariables': { 'fontFamily': 'ui-sans-serif, system-ui, sans-serif', 'fontSize': '15px', 'darkMode': false }}}%%

    %% HEADER
    subgraph Header [" FlightTracker Architecture "]
        direction TB
        Subtitle[" Next.js 14 (App Router) • Google Cloud Run • Aviationstack "]:::subtitle
    end

    %% FRONTEND LAYER
    subgraph Frontend_Layer ["FRONTEND (USER DEVICE)"]
        direction TB
        subgraph Client_App ["Browser Client"]
            direction TB
            Page["Page.tsx<br/>(Client Component)"]:::blueGradient
            
            subgraph UI_Components ["Interactive Components"]
                direction LR
                FlightCard["FlightCard<br/>(Display Details)"]:::lightBlue
                FlightMap["FlightMap<br/>(React Leaflet)"]:::lightGreen
            end
            
            Styling["Tailwind CSS<br/>(Styling)"]:::grayPill
        end
    end

    %% CONNECTOR
    HTTPS_DNS(" HTTPS / GoDaddy DNS<br/>(Custom Domain)    "):::pill

    %% CLOUD LAYER
    subgraph Cloud_Layer ["GOOGLE CLOUD PLATFORM"]
        direction TB
        subgraph Cloud_Run ["Cloud Run Service (Serverless)"]
            direction TB
            APIRoute[" API Route<br/>/api/flights    "]:::orangeGradient
        end
    end

    %% EXTERNAL LAYER
    subgraph External_Layer ["EXTERNAL SERVICES"]
        AviationStack[" Aviationstack API<br/>(Real-time Flight Data)    "]:::purpleGradient
    end

    %% RELATIONS
    Subtitle ~~~ Client_App
    Page --> UI_Components
    Page -.- Styling
    Client_App ==>|"1. Request"| HTTPS_DNS
    HTTPS_DNS ==>|"2. Route"| Cloud_Run
    Page --"3. Fetch /api/flights"--> APIRoute
    APIRoute --"4. Proxy Request"--> AviationStack
    AviationStack --"5. JSON Data"--> APIRoute
    APIRoute --"6. Response"--> Page

    %% STYLES
    classDef subtitle fill:none,stroke:none,color:#475569,font-size:16px,font-weight:bold;
    classDef blueGradient fill:#3b82f6,stroke:#2563eb,color:#fff,rx:5,ry:5,font-weight:bold,font-size:14px;
    classDef lightBlue fill:#bfdbfe,stroke:#3b82f6,color:#1e3a8a,rx:5,ry:5,font-weight:bold;
    classDef lightGreen fill:#bbf7d0,stroke:#22c55e,color:#14532d,rx:5,ry:5,font-weight:bold;
    classDef pill fill:#1e293b,stroke:#0f172a,color:#fff,rx:20,ry:20,font-weight:bold;
    classDef grayPill fill:#f1f5f9,stroke:#cbd5e1,color:#334155,rx:10,ry:10,font-size:14px,font-weight:bold;
    classDef orangeGradient fill:#f97316,stroke:#ea580c,color:#fff,rx:5,ry:5,font-weight:bold;
    classDef purpleGradient fill:#a855f7,stroke:#9333ea,color:#fff,rx:5,ry:5,font-weight:bold;

    %% Subgraph Styles
    style Header fill:none,stroke:none
    style Frontend_Layer fill:#f8fafc,stroke:#cbd5e1,stroke-width:2px,color:#334155,font-weight:bold
    style Cloud_Layer fill:#fff7ed,stroke:#fdba74,stroke-width:2px,color:#9a3412,font-weight:bold
    style External_Layer fill:#faf5ff,stroke:#e9d5ff,stroke-width:2px,color:#6b21a8,font-weight:bold
    style Client_App fill:#eff6ff,stroke:#bfdbfe,stroke-width:1px,color:#1e3a8a,font-weight:bold
    style Cloud_Run fill:#fff,stroke:#f97316,stroke-width:1px,color:#c2410c,font-weight:bold`}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
