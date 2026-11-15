import { test } from 'node:test';
import assert from 'node:assert/strict';
import { taxCents } from './invoicing/index.js';

function makeInvoice() {
  return {
    id: 'INV-1002',
    customerName: 'Bob Diaz',
    customerEmail: 'bob.diaz@example.invalid',
    dueDate: '2026-11-01',
    taxRateBasisPoints: 825,
    lines: [{ description: 'Widget', quantity: 3, unitPriceCents: 835 }],
    paymentsCents: [],
  };
}

test('tax on invoice 1002 matches the claim', () => {
  // Doubles: none.
  // Why: the claim is the tax is 207 cents, worked out by hand. The expected value must come from the claim, not the library.
  const invoice = makeInvoice();
  const expected = 207;
  assert.equal(taxCents(invoice), expected);
});
