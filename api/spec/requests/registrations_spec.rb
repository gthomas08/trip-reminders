require "rails_helper"

RSpec.describe "POST /signup", type: :request do
  let(:valid_params) do
    { user: { email: "new@example.com", password: "password123", password_confirmation: "password123" } }
  end

  context "with valid params" do
    it "creates a user and returns 201" do
      expect {
        post "/signup", params: valid_params, as: :json
      }.to change(User, :count).by(1)

      expect(response).to have_http_status(:created)
    end

    it "returns token and email" do
      post "/signup", params: valid_params, as: :json
      body = response.parsed_body
      expect(body).to include("token", "email")
      expect(body["email"]).to eq("new@example.com")
    end
  end

  context "with invalid params" do
    it "returns 422 when email is blank" do
      post "/signup", params: { user: { email: "", password: "password123" } }, as: :json
      expect(response).to have_http_status(:unprocessable_entity)
      expect(response.parsed_body).to have_key("errors")
    end

    it "returns 422 when password is too short" do
      post "/signup", params: { user: { email: "a@b.com", password: "short", password_confirmation: "short" } }, as: :json
      expect(response).to have_http_status(:unprocessable_entity)
    end

    it "returns 422 on duplicate email" do
      create(:user, email: "dupe@example.com")
      post "/signup", params: { user: { email: "dupe@example.com", password: "password123", password_confirmation: "password123" } }, as: :json
      expect(response).to have_http_status(:unprocessable_entity)
    end
  end
end
