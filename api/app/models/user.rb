class User < ApplicationRecord
  TRAVELER_TYPES = %w[
    adventurer explorer nomad pioneer wanderer voyager backpacker globetrotter
  ].freeze

  has_secure_password

  has_many :trips, dependent: :destroy

  validates :email, presence: true, uniqueness: { case_sensitive: false },
            format: { with: URI::MailTo::EMAIL_REGEXP }
  validates :password, length: { minimum: 8 }, if: :password_digest_changed?
  validates :traveler_type, inclusion: { in: TRAVELER_TYPES }, allow_nil: true

  normalizes :email, with: ->(email) { email.strip.downcase }

  before_create :generate_token

  private

  def generate_token
    self.token = SecureRandom.hex(32)
  end
end
