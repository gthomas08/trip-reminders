class Trip < ApplicationRecord
  validates :destination, presence: true
  validates :trip_date, presence: true

  scope :upcoming, -> { where("trip_date >= ?", Date.current) }
  scope :in_next_days, ->(days) { where("trip_date BETWEEN ? AND ?", Date.current, Date.current + days.days) }
end
