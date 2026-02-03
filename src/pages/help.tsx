import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Skeleton } from '@/components/ui/skeleton';
import {
  useHelpFaqs,
  useHelpDocLinks,
  useHelpChangelog,
} from '@/hooks/useHelp';
import { SupportContactForm } from '@/components/help/support-contact-form';
import {
  BookOpen,
  ChevronRight,
  ExternalLink,
  FileText,
  HelpCircle,
  MessageCircle,
  Search,
  Download,
  Calendar,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const QUICK_START_CARDS = [
  {
    title: 'Install Gateway',
    description: 'Download and run the Clawgate gateway on your machine to get started.',
    href: '/download',
    icon: Download,
    cta: 'Download',
  },
  {
    title: 'Connect first channel',
    description: 'Add Telegram, Slack, Discord, or WhatsApp so you can talk to your agent from chat.',
    href: '/channels',
    icon: MessageCircle,
    cta: 'Channels',
  },
  {
    title: 'Open Control UI',
    description: 'Use the dashboard to monitor sessions, runs, skills, and nodes.',
    href: '/dashboard',
    icon: Sparkles,
    cta: 'Dashboard',
  },
];

export function Help() {
  const [faqSearch, setFaqSearch] = useState('');
  const { data: faqs = [], isLoading: faqsLoading } = useHelpFaqs();
  const { data: docLinks = [], isLoading: docLinksLoading } = useHelpDocLinks();
  const { data: changelog = [], isLoading: changelogLoading } = useHelpChangelog();

  const filteredFaqs = useMemo(() => {
    if (!faqSearch.trim()) return faqs;
    const q = faqSearch.trim().toLowerCase();
    return faqs.filter(
      (f) =>
        f.question_text.toLowerCase().includes(q) ||
        f.answer_text.toLowerCase().includes(q) ||
        (f.category && f.category.toLowerCase().includes(q))
    );
  }, [faqs, faqSearch]);

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Header & breadcrumbs */}
      <header className="space-y-2">
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link
            to="/dashboard"
            className="transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded"
          >
            Dashboard
          </Link>
          <ChevronRight className="h-4 w-4 shrink-0" aria-hidden />
          <span className="text-foreground font-medium">About / Help</span>
        </nav>
        <h1 className="text-2xl font-semibold tracking-tight">About / Help</h1>
        <p className="text-muted-foreground max-w-xl">
          Quick start guides, FAQs, documentation links, and support. Find what you need in a few
          clicks.
        </p>
      </header>

      {/* Quick start cards */}
      <section aria-labelledby="quick-start-heading">
        <h2 id="quick-start-heading" className="mb-4 text-lg font-semibold">
          Quick start
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {QUICK_START_CARDS.map((item, i) => (
            <Card
              key={item.href}
              className={cn(
                'rounded-[10px] border border-border bg-card shadow-card transition-all duration-200 hover:shadow-card-hover hover:border-primary/30',
                'animate-fade-in-up'
              )}
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/15 text-primary">
                    <item.icon className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-base">{item.title}</CardTitle>
                </div>
                <CardDescription className="text-sm">{item.description}</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <Button variant="outline" size="sm" className="rounded-md" asChild>
                  <Link to={item.href}>{item.cta}</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* FAQ with search */}
      <section aria-labelledby="faq-heading">
        <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 id="faq-heading" className="text-lg font-semibold">
            Frequently asked questions
          </h2>
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search FAQs…"
              value={faqSearch}
              onChange={(e) => setFaqSearch(e.target.value)}
              className="rounded-md border border-input pl-9 pr-3 py-2"
              aria-label="Search FAQs"
            />
          </div>
        </div>
        {faqsLoading ? (
          <Card className="rounded-[10px] border border-border">
            <CardContent className="p-6">
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-12 w-full rounded-md" />
                ))}
              </div>
            </CardContent>
          </Card>
        ) : filteredFaqs.length === 0 ? (
          <Card className="rounded-[10px] border border-border bg-card">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <HelpCircle className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {faqSearch.trim()
                  ? 'No FAQs match your search. Try different keywords.'
                  : 'No FAQs yet. Check back later or contact support.'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <Accordion type="single" collapsible className="w-full">
            {filteredFaqs.map((faq) => (
              <AccordionItem key={faq.id} value={faq.id}>
                <AccordionTrigger className="text-left font-medium hover:no-underline">
                  {faq.question_text}
                </AccordionTrigger>
                <AccordionContent>
                  <div className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground">
                    {faq.answer_text}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </section>

      {/* Documentation links */}
      <section aria-labelledby="docs-heading">
        <h2 id="docs-heading" className="mb-4 text-lg font-semibold">
          Documentation
        </h2>
        {docLinksLoading ? (
          <ul className="space-y-2">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-10 w-full rounded-md" />
            ))}
          </ul>
        ) : docLinks.length === 0 ? (
          <Card className="rounded-[10px] border border-border bg-card">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Documentation links will appear here.</p>
              <Button variant="link" className="mt-2" asChild>
                <a
                  href="https://docs.clawgate.example"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1"
                >
                  Open docs <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <ul className="grid gap-2 sm:grid-cols-2">
            {docLinks.map((link) => (
              <li key={link.id}>
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    'flex items-center gap-2 rounded-md border border-border bg-card px-4 py-3',
                    'text-foreground transition-all duration-200 hover:border-primary/50 hover:shadow-card',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
                  )}
                >
                  <BookOpen className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <span className="flex-1 font-medium">{link.title}</span>
                  <ExternalLink className="h-4 w-4 shrink-0 text-muted-foreground" />
                </a>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Support form */}
      <section aria-labelledby="support-heading">
        <h2 id="support-heading" className="mb-4 text-lg font-semibold">
          Contact support
        </h2>
        <SupportContactForm />
      </section>

      {/* Changelog */}
      <section aria-labelledby="changelog-heading">
        <h2 id="changelog-heading" className="mb-4 text-lg font-semibold">
          Changelog
        </h2>
        {changelogLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-16 w-full rounded-md" />
            ))}
          </div>
        ) : changelog.length === 0 ? (
          <Card className="rounded-[10px] border border-border bg-card">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Changelog entries will appear here.</p>
            </CardContent>
          </Card>
        ) : (
          <ul className="space-y-0 border-l-2 border-border pl-6">
            {changelog.map((entry) => (
              <li key={entry.id} className="relative pb-6 last:pb-0">
                <span
                  className="absolute -left-[29px] top-1.5 h-3 w-3 rounded-full bg-primary"
                  aria-hidden
                />
                <div className="flex flex-wrap items-baseline gap-2">
                  {entry.version_number && (
                    <span className="font-medium text-foreground">{entry.version_number}</span>
                  )}
                  <time
                    dateTime={entry.date}
                    className="text-sm text-muted-foreground"
                  >
                    {new Date(entry.date).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </time>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{entry.description}</p>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Footer */}
      <footer className="border-t border-border pt-8">
        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          <Link
            to="/terms"
            className="transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
          >
            Terms of Service
          </Link>
          <Link
            to="/privacy"
            className="transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
          >
            Privacy Policy
          </Link>
          <a
            href="https://docs.clawgate.example"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
          >
            Docs <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      </footer>
    </div>
  );
}
