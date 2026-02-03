import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { AuthProvider } from '@/contexts/auth-context';
import { RequireAuth } from '@/components/auth/require-auth';
import { OperationStateProviderWithUI } from '@/components/loading';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Landing } from '@/pages/landing';
import { Login } from '@/pages/login';
import { Signup } from '@/pages/signup';
import { PasswordReset } from '@/pages/password-reset';
import { EmailVerification } from '@/pages/email-verification';
import { Profile } from '@/pages/profile';
import { DownloadPage } from '@/pages/download';
import { Dashboard } from '@/pages/dashboard';
import { Chat } from '@/pages/chat';
import { Channels } from '@/pages/channels';
import { Skills } from '@/pages/skills';
import { SkillEditor } from '@/pages/skill-editor';
import { Nodes } from '@/pages/nodes';
import { Cron } from '@/pages/cron';
import { Webhooks } from '@/pages/webhooks';
import { Browser } from '@/pages/browser';
import { Voice } from '@/pages/voice';
import { Settings } from '@/pages/settings';
import { Security } from '@/pages/security';
import { Logs } from '@/pages/logs';
import { Admin } from '@/pages/admin';
import { Help } from '@/pages/help';
import { Privacy } from '@/pages/privacy';
import { Terms } from '@/pages/terms';
import { NotFound } from '@/pages/not-found';
import { ServerError } from '@/pages/server-error';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 10,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <OperationStateProviderWithUI>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/forgot-password" element={<PasswordReset />} />
              <Route path="/verify-email" element={<EmailVerification />} />
              <Route path="/download" element={<DownloadPage />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/500" element={<ServerError />} />

              <Route element={<DashboardLayout />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/profile" element={<RequireAuth />}>
                  <Route index element={<Profile />} />
                </Route>
                <Route path="/chat" element={<Chat />} />
                <Route path="/channels" element={<Channels />} />
                <Route path="/skills" element={<Skills />} />
                <Route path="/skill-editor/:skillId?" element={<SkillEditor />} />
                <Route path="/nodes" element={<Nodes />} />
                <Route path="/cron" element={<Cron />} />
                <Route path="/webhooks" element={<Webhooks />} />
                <Route path="/browser" element={<Browser />} />
                <Route path="/voice" element={<Voice />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/security" element={<Security />} />
                <Route path="/logs" element={<Logs />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="/help" element={<Help />} />
              </Route>

              <Route path="/404" element={<NotFound />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </OperationStateProviderWithUI>
        </AuthProvider>
      </BrowserRouter>
      <Toaster position="top-right" richColors closeButton />
    </QueryClientProvider>
  );
}
