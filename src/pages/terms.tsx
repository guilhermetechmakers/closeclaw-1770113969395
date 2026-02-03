import { useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, ChevronDown, ChevronRight, FileText, Mail } from 'lucide-react';
import { useTermsDocument, useUserAgreement, useRecordAgreement, useSubmitDeclineFeedback } from '@/hooks/useTerms';
import { useAuth } from '@/contexts/auth-context';
import { TermsDeclineFeedbackDialog } from '@/components/terms/terms-decline-feedback-dialog';
import type { DeclineFeedbackFormValues } from '@/components/terms/terms-decline-feedback-dialog';
import { DownloadConfirmationDialog } from '@/components/privacy/download-confirmation-dialog';

/** Default terms sections when no document is in the database. */
const DEFAULT_TERMS_SECTIONS = [
  {
    id: 'acceptance',
    title: 'Acceptance of terms',
    content:
      'By accessing or using Clawgate software and any associated cloud features, you agree to be bound by these Terms of Service. If you do not agree, do not use the service. Local-only use of the gateway may be subject to separate terms.',
  },
  {
    id: 'use-of-service',
    title: 'Use of service',
    content:
      'You may use Clawgate for personal or internal business use in accordance with these terms and applicable law. You are responsible for maintaining the security of your credentials and for all activity under your account. You must not use the service for illegal purposes or to violate the rights of others.',
  },
  {
    id: 'account',
    title: 'Account and data',
    content:
      'When you create a cloud-linked account, you provide accurate information and keep it updated. You are responsible for safeguarding your password. Session data, skills, and configurations may be stored locally or, when enabled, in the cloud. We process data as described in our Privacy Policy.',
  },
  {
    id: 'acceptable-use',
    title: 'Acceptable use',
    content:
      'You must not misuse the service, including by attempting to gain unauthorized access, distributing malware, violating laws, or interfering with other users. We may suspend or terminate access for violations and report activity to authorities where required.',
  },
  {
    id: 'ip-and-licence',
    title: 'Intellectual property and licence',
    content:
      'Clawgate software and associated materials are licensed, not sold. We grant you a limited, non-exclusive licence to use the software in accordance with these terms. You retain rights to content you create; you grant us limited rights to operate and improve the service.',
  },
  {
    id: 'disclaimer',
    title: 'Disclaimer',
    content:
      'The service is provided "as is" without warranties of any kind. We do not guarantee uninterrupted or error-free operation. Use of third-party integrations (e.g. channel adapters, model providers) is at your own risk and subject to their terms.',
  },
  {
    id: 'limitation',
    title: 'Limitation of liability',
    content:
      'To the maximum extent permitted by law, we are not liable for indirect, incidental, special, or consequential damages arising from your use of the service. Our total liability is limited to the amount you paid us in the twelve months preceding the claim, or a nominal amount if no fee applied.',
  },
  {
    id: 'changes',
    title: 'Changes to terms',
    content:
      'We may update these terms from time to time. We will notify you of material changes (e.g. by email or in-app notice). Continued use after the effective date constitutes acceptance. If you do not agree, you may stop using cloud features or close your account.',
  },
  {
    id: 'contact',
    title: 'Contact',
    content:
      'For questions about these terms or legal inquiries, contact us at the Legal Contact information provided on this page.',
  },
];

function TermsSection({
  id,
  title,
  content,
  defaultOpen = false,
}: {
  id: string;
  title: string;
  content: string;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <details
      id={id}
      open={open}
      onToggle={(e) => setOpen((e.target as HTMLDetailsElement).open)}
      className="group border-b border-border last:border-b-0"
    >
      <summary className="flex cursor-pointer list-none items-center gap-2 py-4 text-left font-medium text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-md px-1 -mx-1">
        {open ? (
          <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
        ) : (
          <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
        )}
        <span>{title}</span>
      </summary>
      <div className="prose prose-invert prose-sm max-w-none pb-4 pl-6 text-muted-foreground">
        <p className="m-0 leading-relaxed">{content}</p>
      </div>
    </details>
  );
}

const LEGAL_CONTACT_EMAIL = 'legal@clawgate.example.com';

export function Terms() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: termsDoc, isLoading: termsLoading } = useTermsDocument();
  const { data: userAgreement, isLoading: agreementLoading } = useUserAgreement(termsDoc?.id);
  const recordAgreement = useRecordAgreement();
  const submitFeedback = useSubmitDeclineFeedback();

  const [feedbackDialogOpen, setFeedbackDialogOpen] = useState(false);
  const [downloadDialogOpen, setDownloadDialogOpen] = useState(false);

  const termsSections = termsDoc?.content
    ? [{ id: 'terms', title: 'Terms of Service', content: termsDoc.content }]
    : DEFAULT_TERMS_SECTIONS;

  const policyDocumentId = termsDoc?.id;
  const hasResponded = Boolean(userAgreement);
  const isAccepted = userAgreement?.status === 'accepted';

  const handleAccept = useCallback(() => {
    if (!policyDocumentId) return;
    recordAgreement.mutate(
      { policyDocumentId, status: 'accepted' },
      {
        onSuccess: () => {
          navigate('/dashboard', { replace: true });
        },
      }
    );
  }, [policyDocumentId, recordAgreement, navigate]);

  const handleDecline = useCallback(() => {
    if (!policyDocumentId) return;
    recordAgreement.mutate(
      { policyDocumentId, status: 'declined' },
      {
        onSuccess: () => {
          setFeedbackDialogOpen(true);
        },
      }
    );
  }, [policyDocumentId, recordAgreement]);

  const handleFeedbackSubmit = useCallback(
    async (values: DeclineFeedbackFormValues) => {
      await submitFeedback.mutateAsync({
        comments: values.comments.trim(),
        user_agreement_id: userAgreement?.id ?? null,
      });
    },
    [submitFeedback, userAgreement?.id]
  );

  const termsContentForDownload = termsDoc?.content ?? DEFAULT_TERMS_SECTIONS.map((s) => `${s.title}\n\n${s.content}`).join('\n\n');

  const handleDownload = useCallback(() => {
    const blob = new Blob([termsContentForDownload], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'terms-of-service.txt';
    a.click();
    URL.revokeObjectURL(url);
  }, [termsContentForDownload]);

  const handleOpenInNewTab = useCallback(() => {
    const escaped = termsContentForDownload.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br>');
    const blob = new Blob(
      [
        `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Terms of Service - Clawgate</title><style>body{font-family:Inter,sans-serif;max-width:720px;margin:2rem auto;padding:0 1rem;line-height:1.6;color:#e2e8f0;} h1{font-size:1.75rem;} h2{font-size:1.25rem;margin-top:1.5rem;} p{white-space:pre-wrap;}</style></head><body><h1>Terms of Service</h1><p>${escaped}</p></body></html>`,
      ],
      { type: 'text/html;charset=utf-8' }
    );
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank', 'noopener,noreferrer');
    setTimeout(() => URL.revokeObjectURL(url), 5000);
  }, [termsContentForDownload]);

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 animate-fade-in-up">
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-[28px] font-semibold leading-tight text-foreground">
            Terms of Service
          </h1>
          <p className="mt-2 text-base text-muted-foreground">
            Legal terms and conditions governing the use of Clawgate software and associated cloud
            features. Please read them carefully.
          </p>
          {termsDoc && (
            <p className="mt-1 text-sm text-muted-foreground">
              Version {termsDoc.version} · Effective {new Date(termsDoc.effective_date).toLocaleDateString()}
            </p>
          )}
        </header>

        {/* Section nav (anchor links) */}
        {termsSections.length > 1 && (
          <nav aria-label="Terms sections" className="mb-6">
            <ul className="flex flex-wrap gap-2">
              {termsSections.map((section) => (
                <li key={section.id}>
                  <a
                    href={`#${section.id}`}
                    className="text-sm text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded"
                  >
                    {section.title}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        )}

        {/* Full terms text */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" aria-hidden />
              Terms sections
            </CardTitle>
            <CardDescription>
              Expand each section to read the full terms. Use the links above to jump to a section.
            </CardDescription>
          </CardHeader>
          <CardContent className="px-0 sm:px-6">
            <div className="divide-y-0">
              {termsSections.map((section, i) => (
                <TermsSection
                  key={section.id}
                  id={section.id}
                  title={section.title}
                  content={section.content}
                  defaultOpen={i === 0}
                />
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Accept / Decline controls */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-lg">Your agreement</CardTitle>
            <CardDescription>
              {user
                ? hasResponded
                  ? isAccepted
                    ? 'You have accepted the current terms. You can continue using software and cloud features.'
                    : 'You have declined the current terms. You can still use local-only features.'
                  : 'Accept to proceed with software and cloud features, or decline and optionally provide feedback.'
                : 'Sign in to accept or decline the terms. You can still read and download the document.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            {user && !agreementLoading && !termsLoading && policyDocumentId && (
              <>
                {!hasResponded && (
                  <>
                    <Button
                      onClick={handleAccept}
                      disabled={recordAgreement.isPending}
                      className="rounded-[8px] py-3 transition-transform hover:scale-[1.02]"
                    >
                      {recordAgreement.isPending ? 'Processing…' : 'Accept'}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleDecline}
                      disabled={recordAgreement.isPending}
                      className="rounded-[8px] py-3 transition-transform hover:scale-[1.02]"
                    >
                      Decline
                    </Button>
                  </>
                )}
                {hasResponded && (
                  <p className="text-sm text-muted-foreground">
                    {isAccepted ? 'Accepted' : 'Declined'} on{' '}
                    {userAgreement && new Date(userAgreement.agreed_at).toLocaleDateString()}.
                  </p>
                )}
              </>
            )}
            {!user && (
              <Button variant="outline" asChild>
                <Link to="/login" className="rounded-[8px] py-3">
                  Sign in to accept or decline
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Legal contact */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Mail className="h-5 w-5 text-primary" aria-hidden />
              Legal contact
            </CardTitle>
            <CardDescription>
              For questions about these terms or legal inquiries, contact us.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Email:{' '}
              <a
                href={`mailto:${LEGAL_CONTACT_EMAIL}`}
                className="text-primary underline-offset-4 hover:underline"
              >
                {LEGAL_CONTACT_EMAIL}
              </a>
            </p>
          </CardContent>
        </Card>

        {/* Download */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-lg">Download document</CardTitle>
            <CardDescription>
              Save a copy for your records or open in a new tab to print or save as PDF.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              variant="outline"
              onClick={() => setDownloadDialogOpen(true)}
              className="inline-flex items-center gap-2 transition-transform hover:scale-[1.02]"
            >
              <Download className="h-4 w-4" aria-hidden />
              Download Terms of Service
            </Button>
          </CardContent>
        </Card>

        {/* Footer */}
        <footer className="border-t border-border pt-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <Button variant="outline" asChild>
              <Link to="/">Back to home</Link>
            </Button>
            <nav className="flex flex-wrap gap-6">
              <Link
                to="/privacy"
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                Privacy Policy
              </Link>
              <Link
                to="/help"
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                Help &amp; support
              </Link>
            </nav>
          </div>
        </footer>
      </div>

      <TermsDeclineFeedbackDialog
        open={feedbackDialogOpen}
        onOpenChange={setFeedbackDialogOpen}
        onSubmit={handleFeedbackSubmit}
        isSubmitting={submitFeedback.isPending}
      />

      <DownloadConfirmationDialog
        open={downloadDialogOpen}
        onOpenChange={setDownloadDialogOpen}
        onDownload={handleDownload}
        onOpenInNewTab={handleOpenInNewTab}
        title="Download Terms of Service"
        description="Save a copy for your records. You can open it in a new tab to print or save as PDF using your browser."
      />
    </div>
  );
}
