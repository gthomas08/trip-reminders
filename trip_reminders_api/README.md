# Trip Reminders API

A Rails API backend for managing trip reminders.

## Features

- RESTful API for managing trips (create, list, delete)
- PostgreSQL database
- Sidekiq for background job processing

## Prerequisites

- Ruby 3.4.8 (check `.ruby-version`)
- PostgreSQL
- Redis (for Sidekiq)

## Setup

1. Install dependencies:
```bash
bundle install
```

2. Set up the database:
```bash
rails db:create
rails db:migrate
```

3. Configure Redis URL (optional, defaults to `redis://localhost:6379/0`):
```bash
export REDIS_URL=redis://localhost:6379/0
```

## Running the Application

### Development

You'll need to run three processes:

1. **Rails server** (in one terminal):
```bash
rails server
```

2. **Sidekiq worker** (in another terminal):
```bash
bundle exec sidekiq
```

3. **Redis** (make sure Redis is running):
```bash
redis-server
```

Or use the Procfile with a process manager like Foreman:
```bash
gem install foreman
foreman start
```

### Testing the API

The API runs on `http://localhost:3000` by default.

**Endpoints:**
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

## Project Structure

```
app/
  controllers/
    trips_controller.rb    # REST API endpoints
  models/
    trip.rb                # Trip model with validations and scopes
config/
  initializers/
    cors.rb                # CORS configuration for React frontend
    sidekiq.rb             # Sidekiq configuration
db/
  migrate/
    20240217000001_create_trips.rb  # Trips table migration
```

## Environment Variables

- `REDIS_URL` - Redis connection URL (default: `redis://localhost:6379/0`)

## Notes

- CORS is configured to allow requests from `http://localhost:5173` (Vite default) and `http://localhost:3000`.
