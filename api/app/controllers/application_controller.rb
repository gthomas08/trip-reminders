class ApplicationController < ActionController::API
  include Authenticatable

  rescue_from ActiveRecord::RecordNotFound, with: :record_not_found

  private

  def record_not_found
    render json: { errors: [ "Not found" ] }, status: :not_found
  end
end
