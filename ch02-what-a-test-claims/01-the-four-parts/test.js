import { test } from 'node:test';
import assert from 'node:assert/strict';
import { subtotalCents } from './invoicing/index.js';

test('subtotal adds the line totals', () => {
  // Claim: the subtotal is the sum of quantity times unit price over the lines.
  // Fixture: one line, three widgets at 835 cents, so the subtotal should be 2505.
  const invoice = {
    id: 'INV-1002',
    customerName: 'Bob Diaz',
    customerEmail: 'bob.diaz@example.invalid',
    dueDate: '2026-11-01',
    taxRateBasisPoints: 825,
    lines: [{ description: 'Widget', quantity: 3, unitPriceCents: 835 }],
    paymentsCents: [],
  };

  // Action and assertion: ask the library for the subtotal, and check it against the claim.
  assert.equal(subtotalCents(invoice), 2505);
});
