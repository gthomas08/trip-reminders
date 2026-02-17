class TravelerProfileController < ApplicationController
  REDIS_KEY = "traveler_profile_status"

  # POST /traveler_profile/generate
  def generate
    Sidekiq.redis do |conn|
      conn.set(REDIS_KEY, JSON.dump({ status: "running", started_at: Time.now.iso8601 }))
    end
    GenerateTravelerProfileJob.perform_later
    head :accepted
  end

  # GET /traveler_profile/status
  def status
    raw = Sidekiq.redis { |conn| conn.get(REDIS_KEY) }
    render json: raw ? JSON.parse(raw) : { status: "idle" }
  end
end
