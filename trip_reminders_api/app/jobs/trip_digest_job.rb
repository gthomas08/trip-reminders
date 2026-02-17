class TripDigestJob < ApplicationJob
  queue_as :default

  def perform(trips_by_date)
    Rails.logger.info "=" * 50
    Rails.logger.info "TRIP REMINDER DIGEST"
    Rails.logger.info "=" * 50
    Rails.logger.info "Upcoming trips in the next 7 days:"
    Rails.logger.info ""

    trips_by_date.each do |date, trips|
      Rails.logger.info "📅 #{date.strftime('%B %d, %Y')}:"
      trips.each do |trip|
        Rails.logger.info "  ✈️  #{trip.destination}"
        Rails.logger.info "     Notes: #{trip.notes || 'No notes'}"
        Rails.logger.info ""
      end
    end

    Rails.logger.info "=" * 50
    Rails.logger.info "Total trips: #{trips_by_date.values.flatten.count}"
    Rails.logger.info "=" * 50

    # In a real application, you would send an email here:
    # TripMailer.digest(trips_by_date).deliver_now
  end
end
