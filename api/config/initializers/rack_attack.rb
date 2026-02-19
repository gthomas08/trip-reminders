class Rack::Attack
  throttle("logins/ip", limit: 20, period: 1.minute) do |req|
    req.ip if req.path == "/signin" && req.post?
  end

  throttle("logins/email", limit: 10, period: 1.minute) do |req|
    if req.path == "/signin" && req.post?
      email = if req.content_type&.include?("application/json")
        body = req.body.read
        req.body.rewind
        JSON.parse(body).dig("email").to_s rescue ""
      else
        req.params["email"].to_s
      end
      email.downcase.strip.presence
    end
  end

  throttle("signups/ip", limit: 10, period: 1.minute) do |req|
    req.ip if req.path == "/signup" && req.post?
  end

  self.throttled_responder = lambda do |_env|
    [
      429,
      { "Content-Type" => "application/json" },
      [ JSON.generate({ errors: [ "Too many requests. Please try again later." ] }) ]
    ]
  end
end
