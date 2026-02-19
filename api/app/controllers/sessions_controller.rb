class SessionsController < ApplicationController
  before_action :authenticate_user!, only: :destroy

  def create
    user = User.find_by(email: params[:email])

    if user&.authenticate(params[:password])
      render json: { token: user.token, email: user.email }, status: :ok
    else
      render json: { errors: [ "Invalid email or password" ] }, status: :unauthorized
    end
  end

  def destroy
    current_user.regenerate_token!
    head :no_content
  end
end
