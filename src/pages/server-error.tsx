import { Link, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { AlertTriangle, RefreshCw, Home, LayoutDashboard, FileText, Shield, MessageSquare } from 'lucide-react';
import { log500Error } from '@/api/errors';
import { submitReport, type SubmitReportPayload } from '@/api/reports';
import { ReportIssueDialog } from '@/components/errors/report-issue-dialog';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export function ServerError() {
  const location = useLocation();
  const [reportDialogOpen, setReportDialogOpen] = useState(false);

  const attemptedPath = location.pathname + location.search;
  const referrer =
    typeof document !== 'undefined' ? document.referrer || null : null;
  const userAgent =
    typeof navigator !== 'undefined' ? navigator.userAgent : null;

  useEffect(() => {
    log500Error(attemptedPath, referrer, userAgent, {
      path: attemptedPath,
      referrer: referrer ?? undefined,
    });
  }, [attemptedPath, referrer, userAgent]);

  const handleRetry = () => {
    window.location.reload();
  };

  const handleSubmitReport = async (payload: SubmitReportPayload) => {
    await submitReport(payload);
    toast.success('Report sent', {
      description: 'Thank you. We’ll use this to improve reliability.',
    });
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-content items-center justify-between px-4 sm:px-6">
          <Link
            to="/"
            className="text-xl font-semibold text-foreground transition-colors hover:text-primary"
          >
            Clawgate
          </Link>
          <nav className="flex gap-4">
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

      {/* Main */}
      <main className="flex flex-1 flex-col items-center justify-center px-4 py-16 sm:py-24">
        <div
          className={cn(
            'flex w-full max-w-lg flex-col items-center gap-8 text-center',
            'animate-fade-in-up'
          )}
        >
          {/* Error summary card */}
          <div className="rounded-2xl bg-card p-6 shadow-card transition-all duration-200 hover:shadow-card-hover sm:p-8">
            <div className="flex justify-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10">
                <AlertTriangle
                  className="h-12 w-12 text-destructive"
                  aria-hidden
                />
              </div>
            </div>
            <h1 className="mt-6 text-2xl font-semibold text-foreground sm:text-3xl">
              500 Server Error
            </h1>
            <p className="mt-3 text-muted-foreground">
              Something went wrong on our side. We’ve been notified and are
              looking into it. You can retry, go back home, or report more
              details below.
            </p>
            {attemptedPath !== '/' && (
              <p
                className="mt-2 text-sm text-muted-foreground/80"
                aria-live="polite"
              >
                Page:{' '}
                <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
                  {attemptedPath}
                </code>
              </p>
            )}
          </div>

          {/* Actions and links card */}
          <Card className="w-full max-w-md border-border bg-card/50 shadow-card">
            <CardContent className="flex flex-col gap-4 p-6">
              <p className="text-sm font-medium text-foreground">
                What would you like to do?
              </p>
              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:justify-center">
                <Button
                  onClick={handleRetry}
                  className="min-h-[44px] transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98]"
                  aria-label="Retry loading the page"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Retry
                </Button>
                <Button
                  variant="outline"
                  asChild
                  className="min-h-[44px] transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Link to="/">
                    <Home className="mr-2 h-4 w-4" />
                    Home
                  </Link>
                </Button>
                <Button
                  variant="default"
                  onClick={() => setReportDialogOpen(true)}
                  className="min-h-[44px] transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98]"
                  aria-label="Report this issue to support"
                >
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Report issue
                </Button>
                <Button
                  variant="outline"
                  asChild
                  className="min-h-[44px] transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Link to="/dashboard">
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    Dashboard
                  </Link>
                </Button>
              </div>

              {/* Logs & Security Audit links */}
              <div className="mt-2 border-t border-border pt-4">
                <p className="mb-2 text-xs font-medium text-muted-foreground">
                  Logs &amp; security
                </p>
                <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-sm">
                  <Link
                    to="/logs"
                    className="inline-flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <FileText className="h-4 w-4" />
                    Logs &amp; tracing
                  </Link>
                  <Link
                    to="/security"
                    className="inline-flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <Shield className="h-4 w-4" />
                    Security audit
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="mx-auto flex max-w-content flex-wrap items-center justify-between gap-6 px-4 sm:px-6">
          <span className="text-sm text-muted-foreground">© Clawgate</span>
          <div className="flex flex-wrap gap-6">
            <Link
              to="/help"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Documentation
            </Link>
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

      <ReportIssueDialog
        open={reportDialogOpen}
        onOpenChange={setReportDialogOpen}
        onSubmit={handleSubmitReport}
        errorType="500"
        errorContext={{ url: attemptedPath, referrer: referrer ?? undefined }}
      />
    </div>
  );
}
