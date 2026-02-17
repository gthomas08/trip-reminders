# Trip Reminders

A full-stack application for managing trip reminders, built with Ruby on Rails, React, and Sidekiq.

## Overview

This project demonstrates a simple but complete application using:
- **Rails API** - RESTful backend with PostgreSQL
- **React** - Modern frontend with Vite
- **Sidekiq** - Background job processing with scheduled tasks

Users can register trips with a destination, date, and optional notes. A Sidekiq job runs daily to find trips in the next 7 days and generates reminder digests.

## Project Structure

```
.
├── docker-compose.yml          # Infrastructure (PostgreSQL, Redis)
├── trip_reminders_api/          # Rails API backend
│   ├── app/
│   │   ├── controllers/        # REST API endpoints
│   │   ├── models/             # Trip model
│   │   └── jobs/               # Sidekiq jobs
│   ├── config/
│   │   ├── initializers/       # CORS, Sidekiq config
│   │   └── sidekiq.yml         # Scheduled jobs
│   └── db/
│       └── migrate/            # Database migrations
│
└── trip_reminders_frontend/     # React frontend
    ├── src/
    │   ├── api/                # API service functions
    │   ├── components/         # React components
    │   └── App.jsx             # Main app
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

# Start Rails server (terminal 1)
rails server

# Start Sidekiq worker (terminal 2)
bundle exec sidekiq
```

The API will be available at `http://localhost:3000`.

**Sidekiq Web UI**: Visit `http://localhost:3000/sidekiq` to monitor background jobs.

### 3. Frontend Setup

```bash
cd trip_reminders_frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The frontend will be available at `http://localhost:5173`.

## Usage

1. Open the frontend in your browser (`http://localhost:5173`)
2. Add trips using the form (destination, date, optional notes)
3. View all your trips in the list
4. Delete trips by clicking the "Delete" button

## API Endpoints

- `GET /trips` - List all trips
- `POST /trips` - Create a new trip
  ```json
  {
    "trip": {
      "destination": "Paris, France",
      "trip_date": "2024-03-15",
      "notes": "Visiting the Eiffel Tower"
    }
  }
  ```
- `GET /trips/:id` - Get a specific trip
- `DELETE /trips/:id` - Delete a trip

## Background Jobs

### Scheduled Job

The `TripDigestSchedulerJob` runs daily at 8:00 AM (configured in `config/sidekiq.yml`). It:
- Finds all trips with dates in the next 7 days
- Enqueues a `TripDigestJob` to process them

### Digest Job

The `TripDigestJob` logs trip reminders to the Rails logger. In production, you would extend this to send emails via ActionMailer.

### Manual Testing

To manually trigger the digest job:

```bash
cd trip_reminders_api
rails console
> TripDigestSchedulerJob.perform_now
```

## Development

### Running Both Rails and Sidekiq

You can use Foreman to run both Rails and Sidekiq together:

```bash
cd trip_reminders_api
gem install foreman
foreman start
```

This uses the `Procfile` to start both services.

### Environment Variables

**Backend:**
- `REDIS_URL` - Redis connection URL (default: `redis://localhost:6379/0`)
- `DATABASE_HOST` - PostgreSQL host (default: `localhost`)
- `DATABASE_PORT` - PostgreSQL port (default: `5432`)

**Frontend:**
- `VITE_API_BASE_URL` - Backend API URL (default: `http://localhost:3000`)

### Stopping Infrastructure

```bash
# Stop services
docker-compose down

# Stop and remove volumes (clears data)
docker-compose down -v
```

## Technologies Used

- **Ruby on Rails 8.1** - API framework
- **PostgreSQL** - Database
- **Sidekiq** - Background job processing
- **sidekiq-cron** - Scheduled jobs
- **React 19** - Frontend framework
- **Vite** - Build tool
- **rack-cors** - CORS handling

## Next Steps

- Add user authentication
- Implement email notifications via ActionMailer
- Add trip editing functionality
- Add filtering and sorting
- Add tests (Minitest for Rails, Jest/Vitest for React)
