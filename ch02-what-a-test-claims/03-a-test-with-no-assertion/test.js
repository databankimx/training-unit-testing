import { test } from 'node:test';
import assert from 'node:assert/strict';
import { taxCents } from './invoicing/index.js';

test('tax on a zero subtotal is zero', () => {
  // Claim: an invoice with no lines owes no tax.
  const invoice = {
    id: 'INV-0000',
    customerName: 'Nobody',
    customerEmail: 'nobody@example.invalid',
    dueDate: '2026-11-01',
    taxRateBasisPoints: 825,
    lines: [],
    paymentsCents: [],
  };

  taxCents(invoice); // TODO (homework): make this an assertion that the tax is 0
});
