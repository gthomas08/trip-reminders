require "rails_helper"

RSpec.describe Trip, type: :model do
  subject(:trip) { build(:trip) }

  describe "validations" do
    it { is_expected.to be_valid }

    it "requires destination" do
      trip.destination = nil
      expect(trip).not_to be_valid
      expect(trip.errors[:destination]).to include("can't be blank")
    end

    it "requires trip_date" do
      trip.trip_date = nil
      expect(trip).not_to be_valid
      expect(trip.errors[:trip_date]).to include("can't be blank")
    end
  end

  describe "associations" do
    it { is_expected.to belong_to(:user) }
  end

  describe "#as_json" do
    it "only serializes allowed attributes" do
      trip.save!
      json = trip.as_json
      expect(json.keys).to match_array(%w[id destination trip_date notes])
    end

    it "does not expose user_id or timestamps" do
      trip.save!
      json = trip.as_json
      expect(json.keys).not_to include("user_id", "created_at", "updated_at")
    end
  end

  describe "scopes" do
    let(:user) { create(:user) }

    describe ".upcoming" do
      it "returns trips with trip_date >= today" do
        future_trip = create(:trip, user:, trip_date: 1.week.from_now)
        past_trip   = create(:trip, user:, trip_date: 1.week.ago)

        expect(Trip.upcoming).to include(future_trip)
        expect(Trip.upcoming).not_to include(past_trip)
      end

      it "includes trips scheduled for today" do
        todays_trip = create(:trip, user:, trip_date: Date.current)
        expect(Trip.upcoming).to include(todays_trip)
      end
    end

    describe ".sorted_by_date" do
      it "returns upcoming trips before past trips" do
        past_trip   = create(:trip, user:, trip_date: 1.week.ago)
        future_trip = create(:trip, user:, trip_date: 1.week.from_now)

        results = Trip.sorted_by_date.to_a
        expect(results.index(future_trip)).to be < results.index(past_trip)
      end

      it "sorts upcoming trips ascending by date" do
        near  = create(:trip, user:, trip_date: 1.day.from_now)
        far   = create(:trip, user:, trip_date: 1.month.from_now)

        results = Trip.where(id: [near.id, far.id]).sorted_by_date.to_a
        expect(results).to eq([near, far])
      end

      it "sorts past trips descending by date (most recent first)" do
        older  = create(:trip, user:, trip_date: 2.weeks.ago)
        recent = create(:trip, user:, trip_date: 1.week.ago)

        results = Trip.where(id: [older.id, recent.id]).sorted_by_date.to_a
        expect(results).to eq([recent, older])
      end
    end
  end
end
