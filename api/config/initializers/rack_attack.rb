class Rack::Attack
  # Throttle sign-in attempts by IP (20 per minute)
  throttle("logins/ip", limit: 20, period: 1.minute) do |req|
    req.ip if req.path == "/signin" && req.post?
  end

  # Throttle sign-in attempts by email (10 per minute per email)
  throttle("logins/email", limit: 10, period: 1.minute) do |req|
    if req.path == "/signin" && req.post?
      req.params["email"].to_s.downcase.strip.presence
    end
  end

  # Throttle sign-up attempts by IP (10 per minute)
  throttle("signups/ip", limit: 10, period: 1.minute) do |req|
    req.ip if req.path == "/signup" && req.post?
  end

  # Return JSON for throttled requests
  self.throttled_responder = lambda do |_env|
    [
      429,
      { "Content-Type" => "application/json" },
      [ JSON.generate({ errors: [ "Too many requests. Please try again later." ] }) ]
    ]
  end
end
