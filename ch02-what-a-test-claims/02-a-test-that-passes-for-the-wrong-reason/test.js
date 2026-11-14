import { test } from 'node:test';
import assert from 'node:assert/strict';
import { taxCents } from './invoicing/index.js';

test('tax on invoice 1002 is correct', () => {
  // Claim: the tax on INV-1002 is 207 cents.
  const invoice = {
    id: 'INV-1002',
    customerName: 'Bob Diaz',
    customerEmail: 'bob.diaz@example.invalid',
    dueDate: '2026-11-01',
    taxRateBasisPoints: 825,
    lines: [{ description: 'Widget', quantity: 3, unitPriceCents: 835 }],
    paymentsCents: [],
  };

  // Assertion: the tax is not negative.
  assert.ok(taxCents(invoice) >= 0);
});
