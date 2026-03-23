export const THROTTLE_CONFIGS = {
  // Auth — très strict
  AUTH_LOGIN: { ttl: 60_000, limit: 5 },
  AUTH_REGISTER: { ttl: 60_000, limit: 5 },
  AUTH_RESET_PASSWORD: { ttl: 900_000, limit: 3 },

  // Messages — strict
  MESSAGES_SEND: { ttl: 60_000, limit: 30 },

  // Upload — modéré
  UPLOAD: { ttl: 60_000, limit: 10 },

  // Listings — modéré
  LISTINGS_CREATE: { ttl: 60_000, limit: 10 },
  LISTINGS_UPDATE: { ttl: 60_000, limit: 20 },

  // Search — permissif
  SEARCH: { ttl: 60_000, limit: 60 },

  // Offers — modéré
  OFFERS_CREATE: { ttl: 60_000, limit: 15 },

  // Reports — très strict
  REPORTS: { ttl: 60_000, limit: 5 },

  // KYC — 3 submissions per day
  KYC_SUBMIT: { ttl: 86_400_000, limit: 3 },

  // Notifications — permissif (polling 30s)
  NOTIFICATIONS_GET: { ttl: 60_000, limit: 120 },

  // Default global
  DEFAULT: { ttl: 60_000, limit: 100 },
} as const

export type ThrottleConfigKey = keyof typeof THROTTLE_CONFIGS
