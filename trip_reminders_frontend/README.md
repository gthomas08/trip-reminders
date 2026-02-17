# Trip Reminders Frontend

A React frontend for managing trip reminders, built with Vite.

## Features

- View all trips in a clean list
- Add new trips with destination, date, and notes
- Delete trips
- Responsive, modern UI

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure API URL (optional):
```bash
cp .env.example .env
# Edit .env if your API runs on a different port
```

The default API URL is `http://localhost:3000`.

## Running the Application

Start the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:5173` (or the next available port).

## Building for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

## Project Structure

```
src/
  api/
    trips.js              # API service functions
  components/
    TripList.jsx          # Component to display trips
    AddTripForm.jsx       # Form to add new trips
  App.jsx                 # Main app component
  App.css                 # Styles
  main.jsx                # Entry point
```

## Environment Variables

- `VITE_API_BASE_URL` - Backend API URL (default: `http://localhost:3000`)
