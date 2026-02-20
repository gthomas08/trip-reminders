Rails.application.routes.draw do
  get "up" => "rails/health#show", as: :rails_health_check

  Sidekiq::Web.use Rack::Auth::Basic do |u, p|
    expected_user = Rails.env.development? ? "admin" : ENV.fetch("SIDEKIQ_WEB_USER")
    expected_pass = Rails.env.development? ? "admin" : ENV.fetch("SIDEKIQ_WEB_PASSWORD")
    ActiveSupport::SecurityUtils.secure_compare(u, expected_user) &
      ActiveSupport::SecurityUtils.secure_compare(p, expected_pass)
  end
  mount Sidekiq::Web => "/sidekiq"

  post   "signup",  to: "registrations#create"
  post   "signin",  to: "sessions#create"
  delete "signout", to: "sessions#destroy"

  resources :trips, only: [:index, :show, :create, :update, :destroy]

  resource :traveler_profile, controller: :traveler_profile, only: [] do
    post :generate
    get  :status
  end
end
