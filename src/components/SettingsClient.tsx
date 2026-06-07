'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { User, Palette, Coins, Check, Loader2, Sun, Moon, ShieldCheck, FileText, ChevronRight } from 'lucide-react';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useSessionStore } from '@/store/useSessionStore';
import { ACCENTS, CURRENCIES, type AccentId } from '@/lib/settings';
import { updateProfile } from '@/app/auth-actions';
import { formatMoney } from '@/lib/format';
import { cn } from '@/lib/utils';

function Section({
  icon: Icon,
  title,
  desc,
  children,
}: {
  icon: typeof User;
  title: string;
  desc: string;
  children: React.ReactNode;
}) {
  return (
    <section className="card p-5 sm:p-6">
      <div className="mb-4 flex items-start gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-brand-500/15 text-brand-600 dark:text-brand-300">
          <Icon size={19} />
        </span>
        <div>
          <h2 className="font-bold">{title}</h2>
          <p className="text-sm text-ink-soft">{desc}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

export default function SettingsClient({
  signedIn,
  name: initialName,
  email,
}: {
  signedIn: boolean;
  name: string;
  email: string;
}) {
  const accent = useSettingsStore((s) => s.accent);
  const setAccent = useSettingsStore((s) => s.setAccent);
  const currency = useSettingsStore((s) => s.currency);
  const setCurrency = useSettingsStore((s) => s.setCurrency);
  const { theme, resolvedTheme, setTheme } = useTheme();

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const activeTheme = mounted ? theme ?? resolvedTheme : undefined;

  const [name, setName] = useState(initialName);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function saveName() {
    setSaving(true);
    setSaved(false);
    setError(null);
    try {
      const { name: updated } = await updateProfile(name);
      const sess = useSessionStore.getState();
      sess.set({ user: { ...(sess.user ?? {}), name: updated }, mode: sess.mode });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save your name.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      {/* Personal information */}
      <Section icon={User} title="Personal information" desc="Manage how your account appears.">
        {signedIn ? (
          <div className="space-y-4">
            <div>
              <label className="label" htmlFor="settings-name">
                Display name
              </label>
              <input
                id="settings-name"
                className="input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
              />
            </div>
            <div>
              <label className="label" htmlFor="settings-email">
                Email
              </label>
              <input id="settings-email" className="input opacity-70" value={email} disabled readOnly />
              <p className="mt-1 text-xs text-ink-soft">Email is tied to your login and can&apos;t be changed here.</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={saveName}
                disabled={saving || !name.trim() || name.trim() === initialName}
                className="btn-primary"
              >
                {saving ? <Loader2 size={16} className="animate-spin" /> : null}
                Save changes
              </button>
              {saved && (
                <span className="flex items-center gap-1 text-sm font-medium text-income">
                  <Check size={15} /> Saved
                </span>
              )}
              {error && <span className="text-sm text-expense">{error}</span>}
            </div>
          </div>
        ) : (
          <p className="rounded-xl bg-surface-2 px-4 py-3 text-sm text-ink-soft">
            You&apos;re in demo mode. Create a free account to manage your profile — your appearance and currency
            choices below are saved on this device.
          </p>
        )}
      </Section>

      {/* Appearance */}
      <Section icon={Palette} title="Appearance" desc="Choose your accent color and theme.">
        <p className="label">Accent color</p>
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
          {ACCENTS.map((a) => {
            const active = accent === a.id;
            return (
              <button
                key={a.id}
                onClick={() => setAccent(a.id as AccentId)}
                aria-pressed={active}
                className={cn(
                  'group flex flex-col items-center gap-1.5 rounded-2xl border p-3 transition active:scale-[0.97]',
                  active ? 'border-brand-500 bg-brand-500/10' : 'border-line hover:bg-surface-2'
                )}
              >
                <span
                  className="grid h-9 w-9 place-items-center rounded-full text-white shadow"
                  style={{ backgroundColor: a.swatch }}
                >
                  {active && <Check size={16} />}
                </span>
                <span className="text-xs font-semibold">{a.label}</span>
              </button>
            );
          })}
        </div>

        <p className="label mt-5">Theme</p>
        <div className="grid max-w-xs grid-cols-2 gap-2 rounded-2xl bg-surface-2 p-1">
          {[
            { id: 'light', label: 'Light', icon: Sun },
            { id: 'dark', label: 'Dark', icon: Moon },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTheme(t.id)}
              className={cn(
                'flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold transition active:scale-[0.98]',
                activeTheme === t.id ? 'bg-surface text-ink shadow-sm' : 'text-ink-soft'
              )}
            >
              <t.icon size={16} /> {t.label}
            </button>
          ))}
        </div>
      </Section>

      {/* Currency */}
      <Section icon={Coins} title="Currency" desc="Used to display all amounts across the app.">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="sm:max-w-xs sm:flex-1">
            <label className="label" htmlFor="settings-currency">
              Display currency
            </label>
            <select
              id="settings-currency"
              className="input"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
            >
              {CURRENCIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.label} ({c.code})
                </option>
              ))}
            </select>
          </div>
          <div className="rounded-2xl bg-brand-500/10 px-4 py-3 text-center">
            <p className="text-xs font-medium text-ink-soft">Preview</p>
            <p className="text-xl font-extrabold tabular-nums text-brand-700 dark:text-brand-300">
              {formatMoney(1234.56)}
            </p>
          </div>
        </div>
      </Section>

      {/* Privacy & legal */}
      <Section icon={ShieldCheck} title="Privacy & legal" desc="How DollarMemo handles your data.">
        <Link
          href="/privacy"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between rounded-xl border border-line px-4 py-3 text-sm font-semibold transition hover:bg-surface-2"
        >
          <span className="flex items-center gap-2.5">
            <FileText size={17} className="text-ink-soft" /> Privacy Policy
          </span>
          <ChevronRight size={16} className="text-ink-soft" />
        </Link>
      </Section>
    </div>
  );
}
