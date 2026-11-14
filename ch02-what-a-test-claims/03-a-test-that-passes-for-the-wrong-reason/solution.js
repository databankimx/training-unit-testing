// Invoices, and the calculations that depend only on their data.
//
// An invoice is a plain object: { id, customerName, customerEmail, dueDate, taxRateBasisPoints, lines, paymentsCents }.
// Each line is { description, quantity, unitPriceCents }. Money is whole cents, and dates are ISO strings
// (YYYY-MM-DD), as in the C# and Python ports.

import { parseDate } from './dates.js';

// The quantity times the unit price for each line, added together, in cents.
export function subtotalCents(invoice) {
  return invoice.lines.reduce((sum, line) => sum + line.quantity * line.unitPriceCents, 0);
}

// The tax on the subtotal, rounded half up to the cent. Basis points are hundredths of a percent.
export function taxCents(invoice) {
  return Math.floor((subtotalCents(invoice) * invoice.taxRateBasisPoints) / 10000);
}

// The subtotal plus the tax, in cents.
export function totalCents(invoice) {
  return subtotalCents(invoice) + taxCents(invoice);
}

// The total less the payments. A negative balance is a credit.
export function balanceDueCents(invoice) {
  return totalCents(invoice) - invoice.paymentsCents.reduce((sum, payment) => sum + payment, 0);
}

// True when money is still owed and today is after the due date.
export function isOverdue(invoice, today) {
  return balanceDueCents(invoice) > 0 && parseDate(today) > parseDate(invoice.dueDate);
}
