import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Download,
  ExternalLink,
  FileText,
  MessageSquare,
  Zap,
  Shield,
  Smartphone,
  Globe,
  Clock,
  ChevronRight,
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import {
  LANDING_FEATURES,
  LANDING_INTEGRATIONS,
  LANDING_PRICING_PLANS,
} from '@/data/landing-content';
import type { LandingFeature, LandingPricingPlan } from '@/types/landing';

const FEATURE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  MessageSquare,
  Zap,
  Smartphone,
  Globe,
  Shield,
  Clock,
};

export function Landing() {
  const [pricingModalPlan, setPricingModalPlan] = useState<LandingPricingPlan | null>(null);
  const featuresRef = useScrollReveal<HTMLElement>();
  const quickStartRef = useScrollReveal<HTMLElement>();
  const integrationsRef = useScrollReveal<HTMLElement>();
  const pricingRef = useScrollReveal<HTMLElement>();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed left-0 right-0 top-0 z-40 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-content items-center justify-between px-4 sm:px-6">
          <Link to="/" className="text-xl font-semibold text-foreground">
            Clawgate
          </Link>
          <nav className="flex items-center gap-6">
            <a
              href="#features"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Features
            </a>
            <a
              href="#quick-start"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Quick start
            </a>
            <a
              href="#pricing"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Pricing
            </a>
            <Link
              to="/help"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Docs
            </Link>
            <Link
              to="/login"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Log in
            </Link>
            <Button asChild size="sm">
              <Link to="/signup">Sign up</Link>
            </Button>
          </nav>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="relative overflow-hidden px-4 pt-32 pb-24 sm:px-6 sm:pt-40 sm:pb-32">
          {/* Gradient blobs */}
          <div className="pointer-events-none absolute inset-0">
            <div
              className="landing-hero-blob absolute -left-32 top-20 h-80 w-80 rounded-full opacity-40"
              style={{
                background:
                  'radial-gradient(circle, rgb(var(--primary) / 0.4) 0%, transparent 70%)',
              }}
            />
            <div
              className="landing-hero-blob-2 absolute right-0 top-1/3 h-96 w-96 rounded-full opacity-30"
              style={{
                background:
                  'radial-gradient(circle, rgb(var(--accent) / 0.35) 0%, transparent 70%)',
              }}
            />
            <div
              className="landing-hero-blob-3 absolute bottom-20 left-1/3 h-64 w-64 rounded-full opacity-25"
              style={{
                background:
                  'radial-gradient(circle, rgb(var(--primary) / 0.3) 0%, transparent 70%)',
              }}
            />
          </div>

          <div className="relative mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              Local-first, chat-native personal agent
            </h1>
            <p className="mt-6 text-lg text-muted-foreground sm:text-xl">
              Run tools, schedule jobs, pair devices, and control your agent from the chat
              surfaces you already use.
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <Button
                size="lg"
                asChild
                className="min-h-[44px] transition-transform hover:scale-[1.02] active:scale-[0.98]"
              >
                <Link to="/download" className="inline-flex items-center gap-2">
                  <Download className="h-5 w-5" />
                  Install Gateway
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                asChild
                className="min-h-[44px] transition-transform hover:scale-[1.02] active:scale-[0.98]"
              >
                <Link to="/dashboard" className="inline-flex items-center gap-2">
                  <ExternalLink className="h-5 w-5" />
                  Open Local UI
                </Link>
              </Button>
              <Button
                size="lg"
                variant="ghost"
                asChild
                className="min-h-[44px] text-muted-foreground"
              >
                <Link to="/help" className="inline-flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Docs
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Feature Grid */}
        <section
          id="features"
          ref={featuresRef.ref}
          className={cn(
            'reveal-on-scroll mx-auto max-w-content px-4 py-16 sm:px-6 sm:py-24'
          )}
        >
          <h2 className="text-center text-2xl font-semibold sm:text-3xl">Features</h2>
          <p className="mx-auto mt-4 max-w-2xl text-center text-muted-foreground">
            One gateway for chat, skills, nodes, automation, and security.
          </p>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {LANDING_FEATURES.map((feature, i) => (
              <FeatureCard key={feature.id} feature={feature} index={i} />
            ))}
          </div>
        </section>

        {/* Quick Start */}
        <section
          id="quick-start"
          ref={quickStartRef.ref}
          className={cn(
            'reveal-on-scroll border-t border-border bg-card/30 px-4 py-16 sm:px-6 sm:py-24'
          )}
        >
          <div className="mx-auto max-w-content">
            <h2 className="text-center text-2xl font-semibold sm:text-3xl">
              Quick start
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-center text-muted-foreground">
              Get running in a few steps.
            </p>
            <ol className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {[
                'Install and start the gateway (local-only or cloud-linked).',
                'Open the Control UI at your local URL.',
                'Add a channel (e.g. Telegram) and message your agent.',
                "Try “Summarize this URL” with a link in chat.",
              ].map((step, i) => (
                <li
                  key={i}
                  className="relative flex gap-4 rounded-lg border border-border bg-card p-6 shadow-card transition-shadow hover:shadow-card-hover"
                >
                  <span
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground"
                    aria-hidden
                  >
                    {i + 1}
                  </span>
                  <span className="text-muted-foreground">{step}</span>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Integration Logos */}
        <section
          id="integrations"
          ref={integrationsRef.ref}
          className={cn(
            'reveal-on-scroll mx-auto max-w-content px-4 py-16 sm:px-6 sm:py-24'
          )}
        >
          <h2 className="text-center text-2xl font-semibold sm:text-3xl">
            Works with your stack
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-center text-muted-foreground">
            Chat providers and model backends you can connect today.
          </p>
          <div className="mt-12 flex flex-wrap items-center justify-center gap-8">
            {LANDING_INTEGRATIONS.map((item) => (
              <div
                key={item.id}
                className="flex h-14 min-w-[120px] items-center justify-center rounded-lg border border-border bg-card/50 px-6 py-3 text-sm font-medium text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground"
              >
                {item.providerName}
              </div>
            ))}
          </div>
        </section>

        {/* Pricing Teaser */}
        <section
          id="pricing"
          ref={pricingRef.ref}
          className={cn(
            'reveal-on-scroll border-t border-border bg-card/30 px-4 py-16 sm:px-6 sm:py-24'
          )}
        >
          <div className="mx-auto max-w-content">
            <h2 className="text-center text-2xl font-semibold sm:text-3xl">
              Plans
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-center text-muted-foreground">
              Start free, scale when you need more.
            </p>
            <div className="mt-12 grid gap-6 sm:grid-cols-3">
              {LANDING_PRICING_PLANS.map((plan) => (
                <Card
                  key={plan.id}
                  className="cursor-pointer transition-all duration-200 hover:scale-[1.02] hover:shadow-card-hover"
                  onClick={() => setPricingModalPlan(plan)}
                >
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">{plan.planName}</CardTitle>
                    <CardDescription>{plan.description}</CardDescription>
                    <p className="mt-2 text-2xl font-semibold text-foreground">
                      {plan.price}
                    </p>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      {plan.features.slice(0, 3).map((f, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <ChevronRight className="h-4 w-4 text-accent" />
                          {f}
                        </li>
                      ))}
                    </ul>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-4 w-full"
                      onClick={(e) => {
                        e.stopPropagation();
                        setPricingModalPlan(plan);
                      }}
                    >
                      Learn more
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-border py-12">
          <div className="mx-auto flex max-w-content flex-wrap items-center justify-between gap-6 px-4 sm:px-6">
            <span className="text-sm text-muted-foreground">© Clawgate</span>
            <div className="flex flex-wrap gap-6">
              <Link
                to="/help"
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                Documentation
              </Link>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                Repository
              </a>
              <Link
                to="/privacy"
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                Privacy
              </Link>
              <Link
                to="/terms"
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                Terms
              </Link>
            </div>
          </div>
        </footer>
      </main>

      {/* Pricing detail modal */}
      <Dialog
        open={!!pricingModalPlan}
        onOpenChange={(open) => {
          if (!open) setPricingModalPlan(null);
        }}
      >
        <DialogContent className="max-w-md">
          {pricingModalPlan && (
            <>
              <DialogHeader>
                <DialogTitle>{pricingModalPlan.planName}</DialogTitle>
                <DialogDescription>{pricingModalPlan.description}</DialogDescription>
              </DialogHeader>
              <p className="text-2xl font-semibold text-foreground">
                {pricingModalPlan.price}
              </p>
              <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                {pricingModalPlan.features.map((f, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <ChevronRight className="h-4 w-4 text-accent" />
                    {f}
                  </li>
                ))}
              </ul>
              <Button asChild className="mt-6 w-full">
                <Link to="/signup">Get started</Link>
              </Button>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function FeatureCard({
  feature,
  index,
}: {
  feature: LandingFeature;
  index: number;
}) {
  const Icon = FEATURE_ICONS[feature.iconName] ?? Zap;
  return (
    <Card
      className="transition-all duration-200 hover:scale-[1.02] hover:shadow-card-hover"
      style={{
        transitionDelay: `${index * 50}ms`,
      }}
    >
      <CardHeader>
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="h-6 w-6" />
        </div>
        <CardTitle className="text-lg">{feature.name}</CardTitle>
        <CardDescription>{feature.description}</CardDescription>
      </CardHeader>
    </Card>
  );
}
