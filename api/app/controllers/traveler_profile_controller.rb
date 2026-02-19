class TravelerProfileController < ApplicationController
  before_action :authenticate_user!

  # POST /traveler_profile/generate
  def generate
    return head :conflict if current_user.profile_generating?

    current_user.start_profile_generation!
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
    elsif current_user.profile_generating?
      render json: { status: "running" }
    else
      render json: { status: "idle" }
    end
  end
end
