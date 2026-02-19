module Authenticatable
  extend ActiveSupport::Concern

  included do
    helper_method :current_user if respond_to?(:helper_method)
  end

  def authenticate_user!
    token = extract_bearer_token
    @current_user = User.find_by(token: token) if token

    render json: { errors: [ "Unauthorized" ] }, status: :unauthorized unless @current_user
  end

  def current_user
    @current_user
  end

  private

  def extract_bearer_token
    auth_header = request.headers["Authorization"]
    auth_header&.start_with?("Bearer ") ? auth_header.split(" ").last : nil
  end
end
