class GenerateTravelerProfileJob < ApplicationJob
  queue_as :default

  def perform(user_id)
    sleep(3)

    user = User.find(user_id)
    user.update!(traveler_type: User::TRAVELER_TYPES.sample)

    Sidekiq.redis do |conn|
      conn.del("traveler_profile_status:#{user_id}")
    end
  end
end
