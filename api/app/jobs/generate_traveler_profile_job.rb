class GenerateTravelerProfileJob < ApplicationJob
  queue_as :default

  def perform(user_id)
    sleep(3)

    user = User.find(user_id)
    user.update!(
      traveler_type: User::TRAVELER_TYPES.sample,
      profile_generating: false
    )
  end
end
