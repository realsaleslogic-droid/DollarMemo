// Shared sample-data generator. Used client-side for the no-login demo and
// server-side by the dev seed. Pure TS (no browser-only or Node-only APIs
// beyond crypto.randomUUID, available in both modern browsers and Node 18+).
import type { Transaction } from './types';

const uid = () =>
  typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `tx_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

const rand = (min: number, max: number) => Math.random() * (max - min) + min;
const randInt = (min: number, max: number) => Math.floor(rand(min, max + 1));
const pick = <T>(arr: T[]): T => arr[randInt(0, arr.length - 1)];
const round2 = (n: number) => Math.round(n * 100) / 100;
const chance = (p: number) => Math.random() < p;

type MerchantDef = { name: string; category: string; min: number; max: number };

const MERCHANTS: MerchantDef[] = [
  { name: 'Starbucks', category: 'Food', min: 4, max: 12 },
  { name: 'Whole Foods', category: 'Food', min: 28, max: 140 },
  { name: 'Chipotle', category: 'Food', min: 9, max: 24 },
  { name: 'McDonald’s', category: 'Food', min: 6, max: 18 },
  { name: 'DoorDash', category: 'Food', min: 18, max: 55 },
  { name: 'Trader Joe’s', category: 'Food', min: 22, max: 110 },
  { name: 'Olive Garden', category: 'Food', min: 35, max: 95 },
  { name: 'Amazon', category: 'Shopping', min: 12, max: 220 },
  { name: 'Target', category: 'Shopping', min: 20, max: 180 },
  { name: 'Walmart', category: 'Shopping', min: 25, max: 160 },
  { name: 'Costco', category: 'Shopping', min: 60, max: 320 },
  { name: 'Best Buy', category: 'Shopping', min: 40, max: 600 },
  { name: 'Nike', category: 'Shopping', min: 45, max: 220 },
  { name: 'Uber', category: 'Transportation', min: 8, max: 48 },
  { name: 'Lyft', category: 'Transportation', min: 8, max: 45 },
  { name: 'Shell', category: 'Transportation', min: 30, max: 85 },
  { name: 'Chevron', category: 'Transportation', min: 32, max: 90 },
  { name: 'Metro Transit', category: 'Transportation', min: 2.75, max: 12 },
  { name: 'AMC Theatres', category: 'Entertainment', min: 14, max: 60 },
  { name: 'Steam', category: 'Entertainment', min: 10, max: 70 },
  { name: 'Ticketmaster', category: 'Entertainment', min: 45, max: 280 },
  { name: 'Dave & Buster’s', category: 'Entertainment', min: 25, max: 90 },
  { name: 'CVS Pharmacy', category: 'Healthcare', min: 8, max: 75 },
  { name: 'Walgreens', category: 'Healthcare', min: 9, max: 80 },
  { name: 'One Medical', category: 'Healthcare', min: 40, max: 220 },
  { name: 'USPS', category: 'Other', min: 5, max: 40 },
  { name: 'Etsy', category: 'Other', min: 15, max: 120 },
  { name: 'PayPal', category: 'Other', min: 10, max: 200 },
];

const SUBSCRIPTIONS = [
  { name: 'Netflix', amount: 22.99, recurringId: 'netflix' },
  { name: 'Spotify', amount: 11.99, recurringId: 'spotify' },
  { name: 'ChatGPT Plus', amount: 20.0, recurringId: 'chatgpt' },
  { name: 'Amazon Prime', amount: 14.99, recurringId: 'amazon-prime' },
  { name: 'Apple Music', amount: 10.99, recurringId: 'apple-music' },
  { name: 'YouTube Premium', amount: 13.99, recurringId: 'youtube-premium' },
  { name: 'iCloud+', amount: 2.99, recurringId: 'icloud' },
  { name: 'Adobe Creative Cloud', amount: 59.99, recurringId: 'adobe' },
];

const UTILITIES = [
  { name: 'PG&E Electric', recurringId: 'pge', base: 96 },
  { name: 'Comcast Internet', recurringId: 'comcast', base: 79.99 },
  { name: 'City Water', recurringId: 'water', base: 42 },
  { name: 'AT&T Wireless', recurringId: 'att', base: 75 },
];

const RENT = { name: 'Skyline Apartments', recurringId: 'rent', amount: 2150 };
const SALARY = { name: 'Acme Corp Payroll', recurringId: 'salary', amount: 5200 };

function tx(t: Omit<Transaction, 'id'>): Transaction {
  return { id: uid(), ...t };
}

/** Generate ~14 months of realistic, varied transactions (fewer per month so the demo loads fast). */
export function generateSampleTransactions(): Transaction[] {
  const txs: Transaction[] = [];
  const now = new Date();
  const MONTHS = 14;

  for (let m = MONTHS - 1; m >= 0; m--) {
    const monthStart = new Date(now.getFullYear(), now.getMonth() - m, 1);
    const year = monthStart.getFullYear();
    const month = monthStart.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const isCurrentMonth = m === 0;
    const lastDay = isCurrentMonth ? now.getDate() : daysInMonth;
    const dateOn = (day: number) =>
      new Date(year, month, Math.min(day, daysInMonth), randInt(8, 20), randInt(0, 59)).toISOString();

    for (const payDay of [1, 15]) {
      if (payDay > lastDay) continue;
      const bonus = chance(0.15) ? rand(200, 900) : 0;
      txs.push(
        tx({
          date: dateOn(payDay),
          merchant: SALARY.name,
          category: 'Income',
          amount: round2(SALARY.amount / 2 + bonus),
          type: 'income',
          description: bonus ? 'Salary + performance bonus' : 'Bi-weekly salary',
          isRecurring: true,
          recurringId: SALARY.recurringId,
          frequency: 'monthly',
        })
      );
    }
    if (chance(0.4)) {
      txs.push(
        tx({
          date: dateOn(randInt(5, 25)),
          merchant: pick(['Upwork', 'Fiverr', 'Stripe Payout', 'Etsy Shop']),
          category: 'Income',
          amount: round2(rand(150, 1200)),
          type: 'income',
          description: 'Freelance project',
          isRecurring: false,
          recurringId: null,
          frequency: null,
        })
      );
    }

    if (lastDay >= 1) {
      txs.push(
        tx({
          date: dateOn(1),
          merchant: RENT.name,
          category: 'Housing',
          amount: -RENT.amount,
          type: 'expense',
          description: 'Monthly rent',
          isRecurring: true,
          recurringId: RENT.recurringId,
          frequency: 'monthly',
        })
      );
    }

    for (const u of UTILITIES) {
      const day = randInt(3, 14);
      if (day > lastDay) continue;
      txs.push(
        tx({
          date: dateOn(day),
          merchant: u.name,
          category: 'Utilities',
          amount: -round2(u.base * rand(0.85, 1.2)),
          type: 'expense',
          description: 'Monthly bill',
          isRecurring: true,
          recurringId: u.recurringId,
          frequency: 'monthly',
        })
      );
    }

    SUBSCRIPTIONS.forEach((s, i) => {
      const day = ((i * 3 + 5) % 27) + 1;
      if (day > lastDay) return;
      txs.push(
        tx({
          date: dateOn(day),
          merchant: s.name,
          category: 'Subscriptions',
          amount: -s.amount,
          type: 'expense',
          description: 'Subscription',
          isRecurring: true,
          recurringId: s.recurringId,
          frequency: 'monthly',
        })
      );
    });

    const spendCount = randInt(13, 19);
    for (let i = 0; i < spendCount; i++) {
      const day = randInt(1, lastDay);
      const merchant = pick(MERCHANTS);
      txs.push(
        tx({
          date: dateOn(day),
          merchant: merchant.name,
          category: merchant.category,
          amount: -round2(rand(merchant.min, merchant.max)),
          type: 'expense',
          description: null,
          isRecurring: false,
          recurringId: null,
          frequency: null,
        })
      );
    }
  }

  return txs.sort((a, b) => +new Date(b.date) - +new Date(a.date));
}
