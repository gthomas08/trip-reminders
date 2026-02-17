class TripDigestSchedulerJob < ApplicationJob
  queue_as :default

  def perform
    # Find all trips in the next 7 days
    upcoming_trips = Trip.in_next_days(7)

    if upcoming_trips.any?
      # Group trips by date for better organization
      trips_by_date = upcoming_trips.group_by(&:trip_date)

      # Enqueue a digest job for all upcoming trips
      TripDigestJob.perform_later(trips_by_date)
    else
      Rails.logger.info "No upcoming trips found in the next 7 days"
    end
  end
end
