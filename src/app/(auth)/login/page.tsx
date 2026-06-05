import type { Metadata } from 'next';
import LoginForm from '@/components/auth/LoginForm';

export const metadata: Metadata = { title: 'Log in · FlowTrack' };

export default function LoginPage() {
  // Google is configured in Supabase Auth (Providers), not via app env.
  return <LoginForm googleEnabled />;
}
