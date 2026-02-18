class TravelerProfileController < ApplicationController
  before_action :authenticate_user!

  # POST /traveler_profile/generate
  def generate
    Sidekiq.redis do |conn|
      conn.set(redis_key, JSON.dump({ status: "running", started_at: Time.now.iso8601 }))
    end
    GenerateTravelerProfileJob.perform_later(current_user.id)
    head :accepted
  end

  # GET /traveler_profile/status
  def status
    if current_user.traveler_type.present?
      render json: {
        status: "complete",
        traveler_type: current_user.traveler_type,
        generated_at: current_user.updated_at.iso8601
      }
    else
      raw = Sidekiq.redis { |conn| conn.get(redis_key) }
      render json: raw ? JSON.parse(raw) : { status: "idle" }
    end
  end

  private

  def redis_key
    "traveler_profile_status:#{current_user.id}"
  end
end
