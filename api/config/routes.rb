Rails.application.routes.draw do
  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html

  # Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
  # Can be used by load balancers and uptime monitors to verify that the app is live.
  get "up" => "rails/health#show", as: :rails_health_check

  # Sidekiq web UI (for monitoring jobs in development)
  require "sidekiq/web"
  
  # Simple authentication for Sidekiq::Web in development
  if Rails.env.development?
    Sidekiq::Web.use Rack::Auth::Basic do |username, password|
      # Simple authentication - change these in production!
      username == "admin" && password == "admin"
    end
  end
  
  mount Sidekiq::Web => "/sidekiq"

  # Authentication
  post "signup", to: "registrations#create"
  post "signin", to: "sessions#create"

  # Trip resources
  resources :trips, only: [:index, :show, :create, :destroy]

  # Traveler profile background job showcase
  post "traveler_profile/generate", to: "traveler_profile#generate"
  get  "traveler_profile/status",   to: "traveler_profile#status"
end
