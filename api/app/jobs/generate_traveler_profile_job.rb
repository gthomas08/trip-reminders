class GenerateTravelerProfileJob < ApplicationJob
  queue_as :default

  def perform(user_id)
    user = User.find_by(id: user_id)
    return unless user

    sleep(3)

    user.update!(
      traveler_type: User::TRAVELER_TYPES.sample,
      profile_generating: false
    )
  end
end
