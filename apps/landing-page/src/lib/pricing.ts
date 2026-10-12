// src/lib/pricing.ts

export const PRICING_CONFIG = {
  SUBSCRIPTION_ONLY: 1,
  PURCHASE_ONLY: 2,
  HYBRID: 3,
} as const;

// 1. Create a type based on the values (1 | 2 | 3)
export type ConfigMode = (typeof PRICING_CONFIG)[keyof typeof PRICING_CONFIG];

// 2. Billing mode type
export type BillingMode = 'PURCHASE' | 'SUBSCRIPTION';

// 3. CHANGE THIS TO SWITCH MODES
export const CURRENT_CONFIG_MODE: ConfigMode = PRICING_CONFIG.HYBRID;

// 4. Centralized config map (🔥 no conditionals anymore)
const MODE_CONFIG = {
  [PRICING_CONFIG.SUBSCRIPTION_ONLY]: {
    available: ['SUBSCRIPTION'] as const,
    default: 'SUBSCRIPTION' as const,
  },
  [PRICING_CONFIG.PURCHASE_ONLY]: {
    available: ['PURCHASE'] as const,
    default: 'PURCHASE' as const,
  },
  [PRICING_CONFIG.HYBRID]: {
    available: ['PURCHASE', 'SUBSCRIPTION'] as const,
    default: 'PURCHASE' as const,
  },
} as const;

// 5. Derive values from config
const CURRENT_MODE_CONFIG = MODE_CONFIG[CURRENT_CONFIG_MODE];
export const CURRENT_BILLING_MODE: BillingMode = CURRENT_MODE_CONFIG.default;
export const AVAILABLE_MODES: readonly BillingMode[] = CURRENT_MODE_CONFIG.available;

// 6. Price Points (Centralized for reusability)
export const PRICES = {
  SUBSCRIPTION: '$29/mo',
  PURCHASE: '$199',
  CUSTOM_DOMAIN_ADDON: '$29/mo',
} as const;

// 6. UI text config (unchanged)
export const PRICING_TEXT = {
  PURCHASE: {
    badge: 'LIFETIME DEAL',
    button: 'Buy Once, Own Forever',
    footer: 'Pay once. No recurring fees.',
  },
  SUBSCRIPTION: {
    badge: '',
    button: 'Start 14-Day Free Trial',
    footer: 'Cancel anytime. No hidden fees.',
  },
} as const;
