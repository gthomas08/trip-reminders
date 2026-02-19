class Trip < ApplicationRecord
  SERIALIZED_ATTRIBUTES = %i[id destination trip_date notes].freeze

  belongs_to :user

  validates :destination, presence: true
  validates :trip_date, presence: true

  scope :upcoming, -> { where("trip_date >= ?", Date.current) }
  scope :sorted_by_date, -> {
    order(Arel.sql(
      "CASE WHEN trip_date >= CURRENT_DATE THEN 0 ELSE 1 END ASC, " \
      "CASE WHEN trip_date >= CURRENT_DATE THEN trip_date END ASC, " \
      "trip_date DESC"
    ))
  }

  def as_json(*)
    super(only: SERIALIZED_ATTRIBUTES)
  end
end
