class GenerateTravelerProfileJob < ApplicationJob
  queue_as :default

  LOREM_SENTENCES = [
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    "Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.",
    "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum.",
    "Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia.",
    "Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit.",
    "Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet.",
    "Ut labore et dolore magnam aliquam quaerat voluptatem.",
    "Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse.",
    "Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil.",
    "Temporibus autem quibusdam et aut officiis debitis aut rerum necessitatibus.",
    "Itaque earum rerum hic tenetur a sapiente delectus, ut aut reiciendis.",
    "At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis.",
    "Similique sunt in culpa qui officia deserunt mollitia animi, id est laborum.",
    "Quis nostrum exercitationem ullam corporis suscipit laboriosam.",
    "Nisi ut aliquid ex ea commodi consequatur quid maxime placeat facere possimus.",
    "Totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi.",
    "Architecto beatae vitae dicta sunt explicabo nemo enim ipsam.",
    "Aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos.",
    "Voluptatem sequi nesciunt neque porro quisquam est qui dolorem."
  ].freeze

  def perform
    # Simulating a call to an external traveler profile generation API
    sleep(rand(3..6))

    # Build a random-length profile: 2–5 paragraphs, each with 3–6 sentences
    paragraphs = Array.new(rand(2..5)) do
      LOREM_SENTENCES.sample(rand(3..6)).join(" ")
    end

    profile = paragraphs.join("\n\n")

    Sidekiq.redis do |conn|
      conn.set("traveler_profile_status", JSON.dump({
        status: "complete",
        profile: profile,
        generated_at: Time.now.iso8601
      }))
    end
  end
end
