require "rails_helper"

RSpec.describe "TravelerProfile", type: :request do
  let!(:user) { create(:user) }
  let(:auth_headers) { { "Authorization" => "Bearer #{user.token}" } }

  describe "GET /traveler_profile/status" do
    context "when idle" do
      it "returns idle status" do
        get "/traveler_profile/status", headers: auth_headers
        expect(response).to have_http_status(:ok)
        expect(response.parsed_body["status"]).to eq("idle")
      end
    end

    context "when profile_generating is true" do
      before { user.update!(profile_generating: true) }

      it "returns running status" do
        get "/traveler_profile/status", headers: auth_headers
        expect(response.parsed_body["status"]).to eq("running")
      end
    end

    context "when traveler_type is present" do
      before { user.update!(traveler_type: "explorer") }

      it "returns complete status with traveler_type" do
        get "/traveler_profile/status", headers: auth_headers
        body = response.parsed_body
        expect(body["status"]).to eq("complete")
        expect(body["traveler_type"]).to eq("explorer")
      end
    end
  end

  describe "POST /traveler_profile/generate" do
    it "enqueues a job, sets profile_generating, clears traveler_type, and returns 202" do
      user.update!(traveler_type: "nomad")
      expect {
        post "/traveler_profile/generate", headers: auth_headers
      }.to have_enqueued_job(GenerateTravelerProfileJob)
      expect(response).to have_http_status(:accepted)
      expect(user.reload.profile_generating).to be(true)
      expect(user.reload.traveler_type).to be_nil
    end

    it "returns 409 when already generating" do
      user.update!(profile_generating: true)
      post "/traveler_profile/generate", headers: auth_headers
      expect(response).to have_http_status(:conflict)
    end

    it "returns 401 when unauthenticated" do
      post "/traveler_profile/generate"
      expect(response).to have_http_status(:unauthorized)
    end
  end
end
