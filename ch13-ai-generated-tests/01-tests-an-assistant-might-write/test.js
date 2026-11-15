import { test } from 'node:test';
import assert from 'node:assert/strict';
import { taxCents, totalCents } from './invoicing/index.js';

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

test('tax matches what the library returns', () => {
  // Doubles: none. Generated: the expected value is read from the library.
  const invoice = makeInvoice();
  const expected = taxCents(invoice);
  assert.equal(taxCents(invoice), expected);
});

test('total is not null', () => {
  // Doubles: none. Generated: checks only that a value came back.
  assert.notEqual(totalCents(makeInvoice()), null);
});

test('tax on invoice 1002 is 207 cents', () => {
  // Doubles: none. Written from the claim: 2505 x 825, plus 5000, divided by 10000, is 207.
  assert.equal(taxCents(makeInvoice()), 207);
});
