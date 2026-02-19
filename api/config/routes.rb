Rails.application.routes.draw do
  get "up" => "rails/health#show", as: :rails_health_check

  unless Rails.env.production?
    mount Sidekiq::Web => "/sidekiq"
  end

  post   "signup",  to: "registrations#create"
  post   "signin",  to: "sessions#create"
  delete "signout", to: "sessions#destroy"

  resources :trips, only: [:index, :show, :create, :update, :destroy]

  resource :traveler_profile, controller: :traveler_profile, only: [] do
    post :generate
    get  :status
  end
end
