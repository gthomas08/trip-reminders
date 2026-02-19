class SessionsController < ApplicationController
  def create
    user = User.find_by(email: params[:email]&.strip&.downcase)

    if user&.authenticate(params[:password])
      render json: { token: user.token, email: user.email }, status: :ok
    else
      render json: { errors: [ "Invalid email or password" ] }, status: :unauthorized
    end
  end

  def destroy
    authenticate_user!
    return if performed?

    current_user.regenerate_token!
    head :no_content
  end
end
