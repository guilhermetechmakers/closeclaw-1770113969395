/**
 * Static landing page content
 * Can be replaced by Supabase fetch when landing_* tables are populated
 */

import type { LandingFeature, LandingIntegrationLogo, LandingPricingPlan } from '@/types/landing';

export const LANDING_FEATURES: LandingFeature[] = [
  {
    id: '1',
    name: 'Chat-native control',
    description: 'Control your agent from WhatsApp, Telegram, Slack, and Discord. One gateway, all your channels.',
    iconName: 'MessageSquare',
  },
  {
    id: '2',
    name: 'Skills & tools',
    description: 'Load skills from SKILL.md with gating checks, run tools with sandboxing and policy whitelists.',
    iconName: 'Zap',
  },
  {
    id: '3',
    name: 'Paired nodes',
    description: 'Pair devices via QR or code. Manage exec allowlists, wake config, and approvals per node.',
    iconName: 'Smartphone',
  },
  {
    id: '4',
    name: 'Browser automation',
    description: 'Managed Chromium profile, CDP abstraction, and capture tools for screenshots, PDF, and DOM.',
    iconName: 'Globe',
  },
  {
    id: '5',
    name: 'Security audit',
    description: 'Automated checks for plaintext secrets, open binds, and risky permissions. Remediation and auto-fix.',
    iconName: 'Shield',
  },
  {
    id: '6',
    name: 'Cron & webhooks',
    description: 'Schedule jobs and inbound webhooks with token auth, lifecycle hooks, and payload transforms.',
    iconName: 'Clock',
  },
];

export const LANDING_INTEGRATIONS: LandingIntegrationLogo[] = [
  { id: 'tg', providerName: 'Telegram', category: 'chat' },
  { id: 'wa', providerName: 'WhatsApp', category: 'chat' },
  { id: 'slack', providerName: 'Slack', category: 'chat' },
  { id: 'discord', providerName: 'Discord', category: 'chat' },
  { id: 'openai', providerName: 'OpenAI', category: 'model' },
  { id: 'anthropic', providerName: 'Anthropic', category: 'model' },
  { id: 'ollama', providerName: 'Ollama', category: 'model' },
];

export const LANDING_PRICING_PLANS: LandingPricingPlan[] = [
  {
    id: 'free',
    planName: 'Free',
    description: 'Local gateway, core features',
    price: '$0',
    features: ['Local-only mode', 'Control UI', '1 channel', 'Community support'],
  },
  {
    id: 'pro',
    planName: 'Pro',
    description: 'Cloud-linked, more channels',
    price: 'TBD',
    features: ['Everything in Free', 'Multiple channels', 'Skills registry', 'Email support'],
  },
  {
    id: 'enterprise',
    planName: 'Enterprise',
    description: 'Multi-workspace, SSO, SLA',
    price: 'Contact us',
    features: ['Everything in Pro', 'Admin dashboard', 'RBAC', 'Dedicated support'],
  },
];
