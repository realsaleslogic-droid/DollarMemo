'use client';

import type { Transaction } from './types';
import {
  summarize,
  spendingByCategory,
  subscriptionServices,
  detectSubscriptions,
} from './analytics';
import { formatMoney, formatDate } from './format';
import { categoryLabel } from './categories';

function downloadBlob(content: string, filename: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/** Export transactions (filtered or all) to a CSV file. */
export function exportCSV(txs: Transaction[], filename = 'dollarmemo-transactions.csv') {
  const header = ['Date', 'Merchant', 'Category', 'Type', 'Amount', 'Description'];
  const rows = [...txs]
    .sort((a, b) => +new Date(b.date) - +new Date(a.date))
    .map((t) => [
      new Date(t.date).toISOString().slice(0, 10),
      t.merchant,
      categoryLabel(t.category),
      t.type,
      t.amount.toFixed(2),
      (t.description ?? '').replace(/"/g, '""'),
    ]);

  const csv = [header, ...rows]
    .map((r) => r.map((cell) => `"${String(cell)}"`).join(','))
    .join('\n');

  downloadBlob(csv, filename, 'text/csv;charset=utf-8;');
}

/** Generate a polished PDF financial statement from the given transactions. */
export async function exportPDF(txs: Transaction[], filename = 'dollarmemo-statement.pdf') {
  // Load the (large) PDF libraries only when a PDF is actually exported, so they
  // don't bloat the Reports/Transactions page bundles.
  const [{ default: jsPDF }, { default: autoTable }] = await Promise.all([
    import('jspdf'),
    import('jspdf-autotable'),
  ]);

  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const pageW = doc.internal.pageSize.getWidth();
  const brand = '#14a085';

  // ---- Header band ----
  doc.setFillColor(20, 160, 133);
  doc.rect(0, 0, pageW, 90, 'F');
  doc.setTextColor('#ffffff');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.text('DollarMemo', 40, 45);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.text('Financial Statement', 40, 64);
  doc.setFontSize(9);
  doc.text(`Generated ${new Date().toLocaleString('en-US')}`, pageW - 40, 64, { align: 'right' });

  const { income, expenses, net } = summarize(txs);
  let y = 120;

  // ---- Summary ----
  doc.setTextColor('#111827');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text('Summary', 40, y);
  y += 8;
  autoTable(doc, {
    startY: y,
    theme: 'grid',
    head: [['Metric', 'Amount']],
    body: [
      ['Total Income', formatMoney(income)],
      ['Total Expenses', formatMoney(-expenses)],
      ['Net Cash Flow', formatMoney(net)],
      ['Transactions', String(txs.length)],
    ],
    headStyles: { fillColor: brand, textColor: '#ffffff' },
    styles: { fontSize: 10, cellPadding: 6 },
    columnStyles: { 1: { halign: 'right' } },
    margin: { left: 40, right: 40 },
  });

  // ---- Category breakdown ----
  // @ts-expect-error lastAutoTable is injected by the plugin at runtime
  y = doc.lastAutoTable.finalY + 26;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text('Expenses by Category', 40, y);
  const cats = spendingByCategory(txs);
  autoTable(doc, {
    startY: y + 8,
    theme: 'striped',
    head: [['Category', 'Amount', 'Share']],
    body: cats.map((c) => [c.label, formatMoney(c.total), `${c.pct.toFixed(1)}%`]),
    headStyles: { fillColor: brand, textColor: '#ffffff' },
    styles: { fontSize: 10, cellPadding: 6 },
    columnStyles: { 1: { halign: 'right' }, 2: { halign: 'right' } },
    margin: { left: 40, right: 40 },
  });

  // ---- Subscriptions ----
  const subs = subscriptionServices(txs).length ? subscriptionServices(txs) : detectSubscriptions(txs);
  // @ts-expect-error lastAutoTable injected at runtime
  y = doc.lastAutoTable.finalY + 26;
  if (y > doc.internal.pageSize.getHeight() - 160) {
    doc.addPage();
    y = 60;
  }
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text('Recurring & Subscriptions', 40, y);
  const monthlyTotal = subs.reduce((s, x) => s + x.monthlyCost, 0);
  autoTable(doc, {
    startY: y + 8,
    theme: 'grid',
    head: [['Service', 'Frequency', 'Monthly', 'Annual']],
    body: [
      ...subs.map((s) => [
        s.name,
        s.frequency,
        formatMoney(s.monthlyCost),
        formatMoney(s.annualCost),
      ]),
      ['Total', '', formatMoney(monthlyTotal), formatMoney(monthlyTotal * 12)],
    ],
    headStyles: { fillColor: brand, textColor: '#ffffff' },
    styles: { fontSize: 10, cellPadding: 6 },
    columnStyles: { 2: { halign: 'right' }, 3: { halign: 'right' } },
    margin: { left: 40, right: 40 },
  });

  // ---- Recent transactions (cap to keep it readable) ----
  const recent = [...txs]
    .sort((a, b) => +new Date(b.date) - +new Date(a.date))
    .slice(0, 40);
  doc.addPage();
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor('#111827');
  doc.text('Recent Transactions', 40, 56);
  autoTable(doc, {
    startY: 68,
    theme: 'striped',
    head: [['Date', 'Merchant', 'Category', 'Amount']],
    body: recent.map((t) => [
      formatDate(t.date),
      t.merchant,
      categoryLabel(t.category),
      formatMoney(t.amount),
    ]),
    headStyles: { fillColor: brand, textColor: '#ffffff' },
    styles: { fontSize: 9, cellPadding: 5 },
    columnStyles: { 3: { halign: 'right' } },
    margin: { left: 40, right: 40 },
  });

  doc.save(filename);
}
