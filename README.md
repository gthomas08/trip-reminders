# Trip Reminders

A full-stack application for managing trip reminders, built with Ruby on Rails, TanStack Start, and Sidekiq.

## Overview

This project demonstrates a simple but complete application using:
- **Rails API** — RESTful backend with PostgreSQL
- **TanStack Start** — Full-stack React framework with file-based routing, SSR, and TypeScript
- **Sidekiq** — Background job processing

Users can register trips with a destination, date, and optional notes.

## Project Structure

```
.
├── docker-compose.yml              # Infrastructure (PostgreSQL, Redis)
├── trip_reminders_api/              # Rails API backend
│   ├── app/
│   │   ├── controllers/            # REST API endpoints
│   │   ├── models/                 # Trip model
│   │   └── jobs/                   # Sidekiq jobs
│   ├── config/
│   │   ├── initializers/           # CORS, Sidekiq config
│   │   └── sidekiq.yml             # Scheduled jobs
│   └── db/
│       └── migrate/                # Database migrations
│
└── trip_reminders_frontend/         # TanStack Start frontend
    ├── src/
    │   ├── api/
    │   │   └── trips.ts            # Typed API client
    │   ├── components/
    │   │   └── Header.tsx          # App header
    │   ├── routes/
    │   │   ├── __root.tsx          # Root layout
    │   │   └── index.tsx           # Trips dashboard
    │   └── styles.css
    ├── vite.config.ts
    └── package.json
```

## Prerequisites

- Ruby 3.4.8
- Docker and Docker Compose
- Node.js (v18+)

## Quick Start

### 1. Start Infrastructure

Start PostgreSQL and Redis using Docker Compose:

```bash
docker-compose up -d
```

This starts:
- **PostgreSQL** on port 5432
  - Database: `trip_reminders_api_development`
  - User: `trip_reminders`
  - Password: `trip_reminders_dev`
- **Redis** on port 6379

### 2. Backend Setup

```bash
cd trip_reminders_api

# Install dependencies
bundle install

# Set up database
rails db:create
rails db:migrate

# Start Rails server (terminal 1) — runs on port 3000
rails s

# Start Sidekiq worker (terminal 2)
bundle exec sidekiq
```

The API will be available at `http://localhost:3000`.

**Sidekiq Web UI**: Visit `http://localhost:3000/sidekiq` (login: `admin` / `admin`) to monitor background jobs.

Alternatively, use Foreman to run both Rails and Sidekiq together:

```bash
gem install foreman
foreman start
```

### 3. Frontend Setup

```bash
cd trip_reminders_frontend

# Install dependencies
npm install

# Start development server — runs on port 5173
npm run dev
```

The frontend will be available at `http://localhost:5173`.

## Usage

1. Open the app at `http://localhost:5173`
2. Click **Add Trip** to create a trip (destination, date, optional notes)
3. View all trips sorted by date with upcoming/past badges
4. Delete trips with the trash icon on each card

## API Endpoints

- `GET /trips` — List all trips (ordered by date ascending)
- `POST /trips` — Create a new trip
  ```json
  {
    "trip": {
      "destination": "Paris, France",
      "trip_date": "2024-03-15",
      "notes": "Visiting the Eiffel Tower"
    }
  }
  ```
- `GET /trips/:id` — Get a specific trip
- `DELETE /trips/:id` — Delete a trip

## Environment Variables

**Backend:**
- `REDIS_URL` — Redis connection URL (default: `redis://localhost:6379/0`)
- `DATABASE_HOST` — PostgreSQL host (default: `localhost`)
- `DATABASE_PORT` — PostgreSQL port (default: `5432`)

**Frontend:**

The API base URL is configured in `src/api/trips.ts` (default: `http://localhost:3000`).

### Stopping Infrastructure

```bash
# Stop services
docker-compose down

# Stop and remove volumes (clears all data)
docker-compose down -v
```

## Technologies Used

- **Ruby on Rails 8.1** — API framework
- **PostgreSQL** — Database
- **Sidekiq** — Background jobs
- **rack-cors** — CORS handling
- **TanStack Start** — Full-stack React framework (SSR, file-based routing)
- **TanStack Router** — Type-safe client-side routing
- **React 19** — UI library
- **TypeScript** — End-to-end type safety
- **Tailwind CSS v4** — Styling
- **Vite** — Build tool

## Next Steps

- Add user authentication
- Implement email notifications via ActionMailer
- Add trip editing functionality
- Add filtering and sorting
- Add tests (Minitest for Rails, Vitest for frontend)
