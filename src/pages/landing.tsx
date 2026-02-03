import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Download, ExternalLink, Zap, Shield, MessageSquare } from 'lucide-react';

export function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-content items-center justify-between px-4 sm:px-6">
          <span className="text-xl font-semibold">Clawgate</span>
          <nav className="flex items-center gap-4">
            <Link to="/help" className="text-sm text-muted-foreground hover:text-foreground">
              Docs
            </Link>
            <Link to="/login" className="text-sm text-muted-foreground hover:text-foreground">
              Log in
            </Link>
            <Button asChild>
              <Link to="/signup">Sign up</Link>
            </Button>
          </nav>
        </div>
      </header>

      <main>
        <section className="mx-auto max-w-content px-4 py-24 sm:px-6">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
              Local-first, chat-native personal agent
            </h1>
            <p className="mt-6 text-lg text-muted-foreground">
              Run tools, schedule jobs, pair devices, and control your agent from the chat surfaces you already use.
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <Button size="lg" asChild>
                <Link to="/dashboard" className="inline-flex items-center gap-2">
                  <ExternalLink className="h-5 w-5" />
                  Open Local UI
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/download" className="inline-flex items-center gap-2">
                  <Download className="h-5 w-5" />
                  Install Gateway
                </Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="border-t border-border bg-card/30 py-16">
          <div className="mx-auto max-w-content px-4 sm:px-6">
            <h2 className="text-center text-2xl font-semibold">Features</h2>
            <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {[
                { icon: Zap, title: 'Skills & Tools', desc: 'Load skills from SKILL.md, run tools with gating and sandboxing.' },
                { icon: Shield, title: 'Privacy-first', desc: 'Local gateway, optional cloud. Secrets in keychain.' },
                { icon: MessageSquare, title: 'Multi-channel', desc: 'WhatsApp, Telegram, Slack, Discord adapters.' },
              ].map(({ icon: Icon, title, desc }) => (
                <div
                  key={title}
                  className="rounded-lg border border-border bg-card p-6 shadow-card transition-shadow hover:shadow-card-hover"
                >
                  <Icon className="h-10 w-10 text-primary" />
                  <h3 className="mt-4 font-semibold">{title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-content px-4 py-16 sm:px-6">
          <h2 className="text-center text-2xl font-semibold">Quick start</h2>
          <ol className="mt-8 list-decimal space-y-4 pl-6 text-muted-foreground">
            <li>Install and start the gateway (local-only or cloud-linked).</li>
            <li>Open the Control UI at your local URL.</li>
            <li>Add a channel (e.g. Telegram) and message your agent.</li>
          </ol>
        </section>

        <footer className="border-t border-border py-8">
          <div className="mx-auto flex max-w-content flex-wrap items-center justify-between gap-4 px-4 sm:px-6">
            <span className="text-sm text-muted-foreground">© Clawgate</span>
            <div className="flex gap-6">
              <Link to="/privacy" className="text-sm text-muted-foreground hover:text-foreground">
                Privacy
              </Link>
              <Link to="/terms" className="text-sm text-muted-foreground hover:text-foreground">
                Terms
              </Link>
              <Link to="/help" className="text-sm text-muted-foreground hover:text-foreground">
                Docs
              </Link>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
