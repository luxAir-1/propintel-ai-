// API Configuration
export const API_CONFIG = {
  baseUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001",
  timeout: 30000,
};

// Stripe Configuration
export const STRIPE_CONFIG = {
  publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "",
};

// Auth Configuration
export const AUTH_CONFIG = {
  tokenExpiry: 3600, // 1 hour
  refreshTokenExpiry: 604800, // 7 days
};

// Subscription Plans
export const SUBSCRIPTION_PLANS = {
  investor: {
    name: "Investor",
    price: 79,
    currency: "USD",
    interval: "month",
    features: [
      "Unlimited property analysis",
      "10 saved searches",
      "Basic alerts",
      "Monthly reports",
      "Email support",
    ],
  },
  pro: {
    name: "Pro",
    price: 199,
    currency: "USD",
    interval: "month",
    features: [
      "Everything in Investor +",
      "Unlimited searches",
      "Advanced alerts with SMS",
      "Weekly reports",
      "Portfolio tracking",
      "Priority support",
      "API access",
    ],
  },
  group: {
    name: "Group",
    price: 999,
    currency: "USD",
    interval: "month",
    features: [
      "Everything in Pro +",
      "Unlimited team members",
      "Custom workflows",
      "Advanced analytics",
      "Dedicated account manager",
      "White-label option",
      "24/7 phone support",
    ],
  },
};

// Scoring Configuration
export const SCORING_CONFIG = {
  minScore: 0,
  maxScore: 100,
  weights: {
    location: 0.25,
    financials: 0.35,
    marketConditions: 0.2,
    riskFactors: 0.2,
  },
};

// Cache Configuration
export const CACHE_CONFIG = {
  listings: 3600, // 1 hour
  scores: 86400, // 24 hours
  reports: 604800, // 7 days
};
