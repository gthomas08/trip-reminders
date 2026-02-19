require "rails_helper"

RSpec.describe "Sessions", type: :request do
  let!(:user) { create(:user, email: "test@example.com", password: "password123") }

  describe "POST /signin" do
    context "with valid credentials" do
      it "returns 200 with token and email" do
        post "/signin", params: { email: "test@example.com", password: "password123" }, as: :json
        expect(response).to have_http_status(:ok)
        expect(response.parsed_body).to include("token", "email")
      end

      it "is case-insensitive for email" do
        post "/signin", params: { email: "TEST@EXAMPLE.COM", password: "password123" }, as: :json
        expect(response).to have_http_status(:ok)
      end
    end

    context "with invalid credentials" do
      it "returns 401 for wrong password" do
        post "/signin", params: { email: "test@example.com", password: "wrongpass" }, as: :json
        expect(response).to have_http_status(:unauthorized)
        expect(response.parsed_body).to have_key("errors")
      end

      it "returns 401 for unknown email" do
        post "/signin", params: { email: "nobody@example.com", password: "password123" }, as: :json
        expect(response).to have_http_status(:unauthorized)
      end
    end
  end

  describe "DELETE /signout" do
    context "when authenticated" do
      it "returns 204 and rotates the token" do
        original_token = user.token
        delete "/signout", headers: { "Authorization" => "Bearer #{user.token}" }
        expect(response).to have_http_status(:no_content)
        expect(user.reload.token).not_to eq(original_token)
      end
    end

    context "when unauthenticated" do
      it "returns 401" do
        delete "/signout"
        expect(response).to have_http_status(:unauthorized)
      end
    end
  end
end
