# GymOS Client Portal

GymOS Client Portal is the frontend application for the GymOS Gym Management System. It is built as a single page application (SPA) with React, TypeScript, Vite, and Tailwind CSS v4.

---

## Technology Stack

* **Build Tool**: Vite
* **Core**: React 19, TypeScript
* **Styling**: Tailwind CSS v4 (with native variable mapping and OKLCH color spaces)
* **Icons**: Lucide React
* **State Management**: Zustand (Auth persistence)
* **Data Fetching**: TanStack React Query v5 (Axios queries and automatic mutation refetches)
* **Form Handlers**: React Hook Form + Zod (Strict schema validation and type-safe submissions)

---

## Prerequisites

Ensure you have the following installed on your local machine:
* **Node.js** (version 20 or higher)
* **npm** (comes packaged with Node.js)

---

## Setup & Local Development

Follow these simple steps to set up and run the frontend:

### 1. Install Dependencies
Navigate to the `gym-frontend` directory and install the packages:
```bash
npm install
```

### 2. Run the Development Server
Start the local Vite server:
```bash
npm run dev
```
By default, the application will run at `http://localhost:5173/`.

---

## Proxy Configuration (API Integration)

The frontend communicates with the backend via relative URLs (`/api/v1`).
Vite is pre-configured with a development proxy that forwards all `/api` requests to the Django server running at `http://localhost:8000` (defined in `vite.config.ts`):

```typescript
server: {
  proxy: {
    '/api': 'http://localhost:8000'
  }
}
```

Make sure the backend server is running on `http://localhost:8000` so that API calls resolve correctly.

---

## Premium Visual & UI Features

* **Theme Switcher**: Fully integrated Dark & Light mode switch (persists settings inside `localStorage`).
* **Responsive Layouts**: Designed matching sliding drawer panels for mobile screens alongside desktop layouts.
* **Ambient Glow Backdrops**: Features floating violet/primary blur gradient elements for glassmorphic visual aesthetics.
* **Micro-interactions**: Enhanced hover states and active-status scaling transitions on items.
