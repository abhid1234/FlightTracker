# Code Review Report

## 1. Security

### 1.1 API Key Management
-   **Finding**: The `AVIATIONSTACK_API_KEY` is correctly accessed via `process.env` in `src/app/api/flights/route.ts` and `src/app/api/airports/route.ts`.
-   **Recommendation**: Ensure that the `.env.local` or environment variables in the deployment platform (Cloud Run) are correctly set and not committed to the repository. The `.gitignore` file should include `.env` files.
-   **Verification**: `process.env.AVIATIONSTACK_API_KEY` is used, which is good.

### 1.2 Rate Limiting
-   **Finding**: `src/middleware.ts` implements a basic in-memory rate limiting mechanism.
-   **Risk**: Since it uses an in-memory `Map`, it will not work correctly in a distributed environment (like Cloud Run with multiple instances) because the state is local to each instance. A user could hit different instances and bypass the limit. Also, the `Map` grows indefinitely until the instance is restarted, which could lead to memory leaks if many unique IPs access the service.
-   **Recommendation**: Use an external store like Redis for rate limiting in a distributed environment. Alternatively, for a simple project, rely on Cloud Run's built-in rate limiting or a WAF if available. Also, implement a cleanup mechanism for the `rateLimitStore` to remove old entries.
-   **Code Snippet**:
    ```typescript
    // src/middleware.ts
    const rateLimitStore = new Map<string, { count: number; lastReset: number }>();
    ```

### 1.3 Input Validation
-   **Finding**: Input validation is minimal.
    -   `src/app/api/flights/route.ts`: Checks if `query` exists.
    -   `src/app/api/airports/route.ts`: Checks if `code` and `type` exist.
-   **Recommendation**: Use a validation library like `zod` to validate query parameters strictly. For example, ensure `flight_iata` matches a regex pattern and `limit` is within bounds.

### 1.4 API Exposure
-   **Finding**: The application acts as a proxy to the AviationStack API, hiding the API key.
-   **Good Practice**: This is a good security practice.

## 2. Performance

### 2.1 API Calls
-   **Finding**: `src/app/api/airports/route.ts` fetches 3 pages in parallel (`Promise.all`) to get ~300 flights.
-   **Risk**: This multiplies the API usage by 3 for every user request. If the AviationStack plan has limits, this could be exhausted quickly.
-   **Recommendation**: Implement caching (e.g., using `unstable_cache` in Next.js or a separate cache layer like Redis) to store the results for a short period (e.g., 5-10 minutes) to reduce API calls.

### 2.2 Image Optimization
-   **Finding**: `src/components/FlightCard.tsx` uses `img` tag for aircraft images.
-   **Recommendation**: Use Next.js `<Image />` component for automatic optimization, lazy loading, and placeholder support. The `FlightCard.tsx` component is not using `next/image` for the aircraft background.

### 2.3 Dynamic Imports
-   **Finding**: `src/app/page.tsx` dynamically imports `FlightMap` with `ssr: false`.
-   **Good Practice**: This is good for Leaflet maps as they depend on the `window` object which is not available during SSR.

## 3. Code Quality & Maintainability

### 3.1 Type Safety
-   **Finding**: `any` type is used frequently in `src/app/api/flights/route.ts` and `src/app/api/airports/route.ts` when mapping API responses.
    ```typescript
    flightData.forEach((item: any) => { ... })
    ```
-   **Recommendation**: Define interfaces for the external API response structure to ensure type safety throughout the data flow.

### 3.2 Code Duplication
-   **Finding**: Date and time formatting logic is repeated across components (`FlightCard.tsx`, `page.tsx`, `airport-dashboard/page.tsx`).
-   **Recommendation**: Extract date/time formatting utilities into a shared `src/lib/utils.ts` or `src/utils/date.ts` file.

### 3.3 React Best Practices
-   **Finding**: `key` props are correctly used in lists.
-   **Finding**: `useEffect` dependencies in `AirportDashboard` seem correct.

### 3.4 Hardcoded Values
-   **Finding**: `AIRPORT_COORDS` in `src/components/FlightMap.tsx` is a large hardcoded object.
-   **Recommendation**: Move this to a separate JSON file or constant file (e.g., `src/constants/airports.ts`) to keep the component clean.

## 4. Dependencies

### 4.1 Vulnerabilities
-   **Finding**: `npm audit` revealed 4 vulnerabilities (3 high, 1 critical) in `next` and `@next/eslint-plugin-next`.
-   **Recommendation**: Run `npm audit fix` or upgrade `next` to a secure version.

### 4.2 Deprecations
-   **Finding**: `puppeteer_skip_chromium_download` in `package.json` config is deprecated.
-   **Recommendation**: Move this configuration to an `.npmrc` file or environment variable.

## 5. Other Observations
-   **Dockerfile**: The Dockerfile looks good, using a multi-stage build which keeps the image size small.
-   **Architecture**: The architecture diagram component is a nice touch for documentation.
