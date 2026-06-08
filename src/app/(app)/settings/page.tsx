import Topbar from '@/components/Topbar';
import SettingsClient from '@/components/SettingsClient';
import { createClient } from '@/lib/supabase/server';
import { getPlan } from '@/app/billing-actions';

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let isPro = false;
  if (user) {
    try {
      isPro = (await getPlan()).plan === 'pro';
    } catch {
      isPro = false;
    }
  }

  return (
    <>
      <Topbar title="Settings" subtitle="Personalize your DollarMemo" />
      <SettingsClient
        signedIn={!!user}
        name={(user?.user_metadata?.name as string | undefined) ?? ''}
        email={user?.email ?? ''}
        isPro={isPro}
      />
    </>
  );
}
