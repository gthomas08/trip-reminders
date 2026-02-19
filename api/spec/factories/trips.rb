FactoryBot.define do
  factory :trip do
    association :user
    sequence(:destination) { |n| "Destination #{n}" }
    trip_date { 1.week.from_now.to_date }
    notes { nil }
  end
end
