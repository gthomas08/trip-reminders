class TravelerProfileController < ApplicationController
  before_action :authenticate_user!

  # POST /traveler_profile/generate
  def generate
    Sidekiq.redis do |conn|
      conn.set(redis_key, JSON.dump({ status: "running", started_at: Time.now.iso8601 }))
    end
    GenerateTravelerProfileJob.perform_later
    head :accepted
  end

  # GET /traveler_profile/status
  def status
    raw = Sidekiq.redis { |conn| conn.get(redis_key) }
    render json: raw ? JSON.parse(raw) : { status: "idle" }
  end

  private

  def redis_key
    "traveler_profile_status:#{current_user.id}"
  end
end
