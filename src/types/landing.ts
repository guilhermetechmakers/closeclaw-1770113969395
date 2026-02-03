/**
 * Landing page content types
 * Used for static content and optional Supabase-backed CMS
 */

export interface LandingFeature {
  id: string;
  name: string;
  description: string;
  iconName: string;
}

export interface LandingIntegrationLogo {
  id: string;
  providerName: string;
  logoUrl?: string;
  category: 'chat' | 'model';
}

export interface LandingPricingPlan {
  id: string;
  planName: string;
  description: string;
  price: string;
  features: string[];
}
