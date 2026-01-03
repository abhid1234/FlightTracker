# ✈️ Flight Tracker

A production-ready, real-time Flight Tracking application built with **Next.js 14**, **Tailwind CSS**, and **Google Cloud Run**.

**[Live Demo](https://abhi-flight-tracker.com/)**

![Flight Tracker](/public/blog_images/flight_card.png)

## ✨ Features

-   **🌍 Live Flight Tracking**: Real-time status, altitude, and speed data using the [AviationStack API](https://aviationstack.com).
-   **🛫 Airport Dashboard**: Live Arrivals & Departures board for any airport code (e.g., `JFK`, `LHR`).
-   **⏱️ Smart Duration Logic**: Custom engine that calculates flight duration by accounting for the precise Timezone Offsets of origin and destination, preventing confusing "12 hour" errors on 6 hour flights.
-   **📅 US-Centric UI**: Enforced `MM/DD/YYYY` date formats and specific timezone displays (e.g., "EDT", "GMT").
-   **✈️ Aircraft Imagery**: Dynamic background images based on the specific aircraft model (787 Dreamliner, A380, etc.).

## 🛠️ Tech Stack

-   **Frontend**: Next.js 14 (App Router), React Server Components
-   **Styling**: Tailwind CSS, Lucide Icons
-   **Maps**: React-Leaflet
-   **Infrastructure**: Docker, Google Cloud Run (Serverless)
-   **API**: AviationStack (Flight Data), Unsplash (Images)

## 🚀 Getting Started

### Prerequisites
-   Node.js 18+
-   AviationStack API Key

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/yourusername/flight-tracker.git
    cd flight-tracker
    ```

2.  **Install dependencies**
    ```bash
    npm install
    # Note: Use `npm install --legacy-peer-deps` if you encounter react-leaflet issues
    ```

3.  **Configure Environment**
    Create a `.env.local` file:
    ```bash
    AVIATIONSTACK_API_KEY=your_api_key_here
    ```

4.  **Run Development Server**
    ```bash
    npm run dev
    ```
    Open [http://localhost:3000](http://localhost:3000) with your browser.

## ☁️ Deployment

The project is optimized for **Google Cloud Run**.

1.  **Build Container**
    The included `Dockerfile` is multi-stage and produces a standalone Next.js image (~100MB).

2.  **Deploy Command**
    ```bash
    gcloud run deploy flight-tracker --source . --allow-unauthenticated
    ```

## 🔒 Security

-   **Server-Side Proxy**: All API requests are routed through Next.js API Routes (`/api/flights`), keeping the API Key hidden from the client.
-   **Log Redaction**: Standardized logging middleware automatically redacts sensitive keys from server logs.
-   **Secret Management**: `.env` files are strictly excluded from version control.

## 📜 License

MIT
