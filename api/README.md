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

2. Set environment variables (see [Environment Variables](#environment-variables) below).

3. Set up the database:
```bash
rails db:create
rails db:migrate
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

Set these in your shell or deployment environment. No `.env` file is used — variables must be exported directly.

| Variable | Default | Description |
|---|---|---|
| `DATABASE_NAME` | `api_development` | PostgreSQL database name |
| `DATABASE_USER` | `api` | PostgreSQL username |
| `DATABASE_PASSWORD` | `api_dev` | PostgreSQL password |
| `DATABASE_HOST` | `localhost` | PostgreSQL host |
| `DATABASE_PORT` | `5432` | PostgreSQL port |
| `REDIS_URL` | `redis://localhost:6379/0` | Redis connection URL (Sidekiq) |
| `ALLOWED_ORIGINS` | `http://localhost:5173,http://localhost:5174` | Comma-separated list of allowed CORS origins |
| `RAILS_MAX_THREADS` | `5` | Puma thread count and DB connection pool size |
| `PORT` | `3000` | Port the server listens on |
| `RAILS_ENV` | `development` | Rails environment |

## Notes

- CORS is configured via `ALLOWED_ORIGINS` to allow requests from your frontend origin(s).
- Secrets (e.g. `secret_key_base`) are stored in `config/credentials.yml.enc`. Run `bin/rails credentials:edit` to manage them.
