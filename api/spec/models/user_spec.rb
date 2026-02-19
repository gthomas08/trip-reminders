require "rails_helper"

RSpec.describe User, type: :model do
  subject(:user) { build(:user) }

  describe "validations" do
    it { is_expected.to be_valid }

    context "email" do
      it "requires presence" do
        user.email = nil
        expect(user).not_to be_valid
        expect(user.errors[:email]).to include("can't be blank")
      end

      it "requires uniqueness" do
        create(:user, email: "test@example.com")
        user.email = "test@example.com"
        expect(user).not_to be_valid
        expect(user.errors[:email]).to include("has already been taken")
      end

      it "is case-insensitive for uniqueness" do
        create(:user, email: "test@example.com")
        user.email = "TEST@EXAMPLE.COM"
        expect(user).not_to be_valid
      end

      it "requires a valid format" do
        user.email = "not-an-email"
        expect(user).not_to be_valid
      end

      it "normalizes email to lowercase" do
        user.email = "  UPPER@EXAMPLE.COM  "
        user.save!
        expect(user.reload.email).to eq("upper@example.com")
      end
    end

    context "password" do
      it "requires minimum 8 characters" do
        user.password = "short"
        expect(user).not_to be_valid
        expect(user.errors[:password]).to include(a_string_matching(/minimum/i))
      end

      it "accepts passwords of 8+ characters" do
        user.password = "longenoughpassword"
        expect(user).to be_valid
      end
    end

    context "traveler_type" do
      it "accepts nil" do
        user.traveler_type = nil
        expect(user).to be_valid
      end

      it "accepts valid types" do
        User::TRAVELER_TYPES.each do |type|
          user.traveler_type = type
          expect(user).to be_valid, "expected #{type} to be valid"
        end
      end

      it "rejects invalid types" do
        user.traveler_type = "invalid_type"
        expect(user).not_to be_valid
      end
    end
  end

  describe "associations" do
    it { is_expected.to have_many(:trips).dependent(:destroy) }
  end

  describe "token generation" do
    it "generates a token on create" do
      expect { user.save! }.to change { user.token }.from(nil)
    end

    it "generates a unique hex token" do
      user.save!
      expect(user.token).to match(/\A[a-f0-9]{64}\z/)
    end
  end

  describe "#regenerate_token!" do
    it "changes the token" do
      user.save!
      original_token = user.token
      user.regenerate_token!
      expect(user.reload.token).not_to eq(original_token)
    end
  end

  describe "factory" do
    it "has a valid factory" do
      expect(build(:user)).to be_valid
    end
  end
end
