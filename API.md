# API Documentation

This document outlines the internal API endpoints available in the Flight Tracker application. These endpoints serve as a proxy to external services (like AviationStack) to keep API keys secure on the server side.

## Flights API

### `GET /api/flights`

Fetches real-time flight status and details.

**Parameters:**

| Query Param | Type | Description |
| :--- | :--- | :--- |
| `flight` | `string` | **Required**. The IATA flight number (e.g., `AA123`, `BA456`). |

**Response:**

```json
{
  "flight": {
    "flightNumber": "AA100",
    "origin": {
      "code": "JFK",
      "city": "New York",
      "time": "2023-10-27T18:00:00+00:00",
      "timezone": "America/New_York",
      "terminal": "8",
      "gate": "14"
    },
    "destination": {
      "code": "LHR",
      "city": "London",
      "time": "2023-10-28T06:00:00+00:00",
      "timezone": "Europe/London",
      "terminal": "5",
      "gate": "A10"
    },
    "status": "active",
    "aircraft": {
      "model": "Boeing 777-300ER"
    },
    "live": {
      "latitude": 50.1,
      "longitude": -30.5,
      "altitude": 35000,
      "speed_horizontal": 900,
      "is_ground": false
    }
  }
}
```

**Error Responses:**

- `400 Bad Request`: Missing `flight` parameter.
- `404 Not Found`: Flight not found.
- `500 Internal Server Error`: Upstream API failure.

---

## Airports API

### `GET /api/airports`

Provides static or dynamic data about supported airports (coordinates, full names).

*(Note: Currently used primarily for coordinate lookups in `src/lib/airports.ts`, but this endpoint can be expanded to serve that data dynamically.)*

**Parameters:**

| Query Param | Type | Description |
| :--- | :--- | :--- |
| `code` | `string` | **Optional**. IATA airport code (e.g., `JFK`). |

**Response:**

```json
{
  "code": "JFK",
  "name": "John F. Kennedy International Airport",
  "lat": 40.6413,
  "lon": -73.7781
}
```
