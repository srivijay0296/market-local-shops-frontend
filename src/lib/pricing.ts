// src/lib/pricing.ts

export const PRICING = {
  buyer: {
    monthly: 1500, // INR
    yearly: 15000,
  },
  seller: {
    monthly: 3000,
    yearly: 30000,
  },
};

export type Role = 'buyer' | 'seller';
export type Plan = 'monthly' | 'yearly';

export const getPlanId = (role: Role, plan: Plan) => {
  return `${role}_${plan}`; // e.g., "buyer_monthly"
};
