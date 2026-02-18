class Trip < ApplicationRecord
  belongs_to :user

  validates :destination, presence: true
  validates :trip_date, presence: true

  scope :upcoming, -> { where("trip_date >= ?", Date.current) }
end
