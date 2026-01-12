# System Architecture

## Overview

Flight Tracker is a serverless web application built with **Next.js 14** (App Router). It serves as a real-time dashboard for flight tracking, leveraging the **AviationStack API** for flight data and **Unsplash** for dynamic imagery.

## High-Level Diagram

```mermaid
graph TD
    Client[Browser / Client] -->|HTTPS| NextJS[Next.js Server (Cloud Run)]
    NextJS -->|Internal API Proxy| APIRoute[/api/flights]
    APIRoute -->|Secure Request + API Key| AviationStack[AviationStack API]
    APIRoute -->|Response| NextJS
    NextJS -->|React Server Components| Client
    
    subgraph "Frontend Layer"
        Components[React Components]
        Tailwind[Tailwind CSS]
        Leaflet[Leaflet Maps]
    end
    
    subgraph "Backend Layer"
        APIRoute
        Lib[Lib / Utilities]
    end
```

## Core Components

### 1. Frontend (Next.js App Router)
-   **Server Components (`src/app`)**: Pages are rendered on the server for performance and SEO.
-   **Client Components (`src/components`)**: Interactive elements like `FlightMap` (Leaflet) and search inputs run in the browser.
-   **Styling**: Uses Tailwind CSS for a responsive, mobile-first design.

### 2. API Proxy Layer (`src/app/api`)
-   **Security**: Keeps the sensitive `AVIATIONSTACK_API_KEY` hidden from the client browser.
-   **Transformation**: Normalizes upstream data (which can be messy) into a clean, strictly typed interface for the frontend.
-   **Caching**: (Planned) Can implement HTTP cache control headers to reduce API usage.

### 3. Data Logic (`src/lib`)
-   **`airports.ts`**: Contains static coordinate data for major airports to enable map plotting and distance calculations without needing a separate Geocoding API.
-   **Emissions Logic**: Calculates estimated CO2 emissions based on great-circle distance (Haversine formula) and flight haul type (short/medium/long).

## Deployment

### Docker Container
The application is containerized using a multi-stage Dockerfile:
1.  **Deps**: Installs dependencies.
2.  **Builder**: Builds the Next.js application (`npm run build`).
3.  **Runner**: Minimal production image (Alpine Linux) that runs `next start`.

### Google Cloud Run
-   **Serverless**: Auto-scales from 0 to N instances based on traffic.
-   **Environment Variables**: Secrets are injected at runtime.
