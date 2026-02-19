class TravelerProfileController < ApplicationController
  before_action :authenticate_user!

  # POST /traveler_profile/generate
  def generate
    updated = User.where(id: current_user.id, profile_generating: false)
                  .update_all(profile_generating: true, traveler_type: nil)
    return head :conflict if updated == 0

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
