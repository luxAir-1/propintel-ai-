// User & Auth
export interface User {
  id: string;
  email: string;
  name: string;
  language: string;
  timezone: string;
  createdAt: Date;
  updatedAt: Date;
}

// Subscription
export type SubscriptionPlan = "investor" | "pro" | "group";

export interface Subscription {
  id: string;
  userId: string;
  plan: SubscriptionPlan;
  status: "active" | "canceled" | "past_due";
  stripeCustomerId: string;
  stripeSubscriptionId: string;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Property Listing
export interface Listing {
  id: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  price: number;
  beds: number;
  baths: number;
  sqft: number;
  listingType: "single_family" | "multi_family" | "commercial" | "land";
  imageUrl?: string;
  externalId?: string; // MLS ID, etc.
  createdAt: Date;
  updatedAt: Date;
}

// Property Score
export interface PropertyScore {
  id: string;
  listingId: string;
  userId: string;
  score: number; // 0-100
  summary: string;
  strengths: string[];
  weaknesses: string[];
  createdAt: Date;
  updatedAt: Date;
}

// Property Financials
export interface PropertyFinancials {
  id: string;
  listingId: string;
  userId: string;
  purchasePrice: number;
  downPaymentPercent: number;
  loanAmount: number;
  interestRate: number;
  loanTerm: number;
  monthlyPayment: number;
  rentalIncome: number;
  vacancyRate: number;
  expenses: number;
  cashFlow: number;
  capRate: number;
  roiPercent: number;
  projections?: ProjectionData;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProjectionData {
  year1: number;
  year2: number;
  year3: number;
  year4: number;
  year5: number;
}

// Report
export interface Report {
  id: string;
  userId: string;
  listingId: string;
  title: string;
  status: "draft" | "generating" | "ready" | "expired";
  s3Url?: string;
  signedUrl?: string;
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Alert
export interface Alert {
  id: string;
  userId: string;
  name: string;
  criteria: AlertCriteria;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface AlertCriteria {
  minScore: number;
  maxPrice: number;
  minROI: number;
  cities: string[];
  listingTypes: string[];
}

// Search Profile
export interface SearchProfile {
  id: string;
  userId: string;
  name: string;
  criteria: SearchCriteria;
  resultsCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface SearchCriteria {
  minPrice: number;
  maxPrice: number;
  minBeds: number;
  minBaths: number;
  cities: string[];
  states: string[];
  listingTypes: string[];
}

// Usage Log
export interface UsageLog {
  id: string;
  userId: string;
  action: string;
  metadata: Record<string, unknown>;
  createdAt: Date;
}

// Audit Log
export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  resource: string;
  changes: Record<string, unknown>;
  ipAddress: string;
  createdAt: Date;
}
