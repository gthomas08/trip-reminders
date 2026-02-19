require "rails_helper"

RSpec.describe "Trips", type: :request do
  let!(:user)  { create(:user) }
  let!(:other) { create(:user) }
  let(:auth_headers) { { "Authorization" => "Bearer #{user.token}" } }

  describe "GET /trips" do
    let!(:future_trip) { create(:trip, user:, trip_date: 1.week.from_now) }
    let!(:past_trip)   { create(:trip, user:, trip_date: 1.week.ago) }

    it "returns 200 with trips and pagination metadata" do
      get "/trips", headers: auth_headers
      expect(response).to have_http_status(:ok)
      body = response.parsed_body
      expect(body).to have_key("trips")
      expect(body).to have_key("meta")
    end

    it "only returns the current user's trips" do
      create(:trip, user: other)
      get "/trips", headers: auth_headers
      ids = response.parsed_body["trips"].pluck("id")
      expect(ids).to contain_exactly(future_trip.id, past_trip.id)
    end

    it "returns upcoming trips before past trips" do
      get "/trips", headers: auth_headers
      dates = response.parsed_body["trips"].pluck("trip_date")
      expect(dates.first).to eq(future_trip.trip_date.to_s)
    end

    it "returns 401 when unauthenticated" do
      get "/trips"
      expect(response).to have_http_status(:unauthorized)
    end

    it "does not expose user_id or timestamps" do
      get "/trips", headers: auth_headers
      trip_json = response.parsed_body["trips"].first
      expect(trip_json.keys).to match_array(%w[id destination trip_date notes])
    end
  end

  describe "GET /trips/:id" do
    let!(:trip) { create(:trip, user:) }

    it "returns the trip" do
      get "/trips/#{trip.id}", headers: auth_headers
      expect(response).to have_http_status(:ok)
      expect(response.parsed_body["id"]).to eq(trip.id)
    end

    it "returns 404 for another user's trip" do
      other_trip = create(:trip, user: other)
      get "/trips/#{other_trip.id}", headers: auth_headers
      expect(response).to have_http_status(:not_found)
    end
  end

  describe "POST /trips" do
    let(:valid_params) { { trip: { destination: "Tokyo, Japan", trip_date: 1.month.from_now.to_date.to_s } } }

    it "creates a trip and returns 201" do
      expect {
        post "/trips", params: valid_params, headers: auth_headers, as: :json
      }.to change { user.trips.count }.by(1)
      expect(response).to have_http_status(:created)
    end

    it "returns 422 when destination is blank" do
      post "/trips", params: { trip: { destination: "", trip_date: "2027-01-01" } }, headers: auth_headers, as: :json
      expect(response).to have_http_status(:unprocessable_entity)
      expect(response.parsed_body).to have_key("errors")
    end
  end

  describe "PATCH /trips/:id" do
    let!(:trip) { create(:trip, user:) }

    it "updates the trip" do
      patch "/trips/#{trip.id}", params: { trip: { destination: "Updated City" } }, headers: auth_headers, as: :json
      expect(response).to have_http_status(:ok)
      expect(trip.reload.destination).to eq("Updated City")
    end

    it "returns 404 for another user's trip" do
      other_trip = create(:trip, user: other)
      patch "/trips/#{other_trip.id}", params: { trip: { destination: "Hacked" } }, headers: auth_headers, as: :json
      expect(response).to have_http_status(:not_found)
    end
  end

  describe "DELETE /trips/:id" do
    let!(:trip) { create(:trip, user:) }

    it "destroys the trip and returns 204" do
      expect {
        delete "/trips/#{trip.id}", headers: auth_headers
      }.to change { user.trips.count }.by(-1)
      expect(response).to have_http_status(:no_content)
    end

    it "returns 404 for another user's trip" do
      other_trip = create(:trip, user: other)
      delete "/trips/#{other_trip.id}", headers: auth_headers
      expect(response).to have_http_status(:not_found)
    end
  end
end
