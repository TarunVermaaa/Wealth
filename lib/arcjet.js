// Simple rate limiting implementation without using @arcjet/next directly
// This avoids Windows file access issues with status_pb.js

// In-memory storage for rate limiting
const userRateLimits = new Map();

const aj = {
  // Simple protect function that mimics Arcjet's API
  protect: async (req, { userId, requested = 1 }) => {
    if (!userId) {
      return createDecision(false, null);
    }
    
    const now = Date.now();
    const userLimit = userRateLimits.get(userId) || {
      tokens: 10, // Initial capacity
      lastRefill: now,
    };
    
    // Refill tokens (2 per hour)
    const hoursSinceLastRefill = (now - userLimit.lastRefill) / (1000 * 60 * 60);
    if (hoursSinceLastRefill > 0) {
      const tokensToAdd = Math.floor(hoursSinceLastRefill * 2);
      userLimit.tokens = Math.min(userLimit.tokens + tokensToAdd, 2); // Max capacity is 2
      userLimit.lastRefill = now;
    }
    
    // Check if user has enough tokens
    const hasEnoughTokens = userLimit.tokens >= requested;
    
    // Consume tokens if available
    if (hasEnoughTokens) {
      userLimit.tokens -= requested;
      userRateLimits.set(userId, userLimit);
      return createDecision(true, null);
    } else {
      // Calculate time until next token is available
      const secondsUntilRefill = Math.ceil((1 / 2) * 60 * 60); // Time for 1 token at rate of 2/hour
      return createDecision(false, {
        isRateLimit: () => true,
        remaining: 0,
        reset: secondsUntilRefill,
      });
    }
  }
};

// Helper to create decision object
function createDecision(allowed, reasonData) {
  return {
    isDenied: () => !allowed,
    reason: reasonData,
  };
}

export default aj;
