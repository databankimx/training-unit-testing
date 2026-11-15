import { test } from 'node:test';
import assert from 'node:assert/strict';
import { volumeDiscountCents } from './invoicing/index.js';

function makeInvoice(unitPriceCents) {
  return {
    id: 'INV-2001',
    customerName: 'Acme Ltd',
    customerEmail: 'ap@acme.example.invalid',
    dueDate: '2026-12-01',
    taxRateBasisPoints: 0,
    lines: [{ description: 'Bulk order', quantity: 1, unitPriceCents }],
    paymentsCents: [],
  };
}

test('no discount at exactly the threshold', () => {
  // Claim: an order of exactly 10000 cents gets no discount, because the rule says above the threshold.
  assert.equal(volumeDiscountCents(makeInvoice(10000)), 0);
});

test('five percent above the threshold', () => {
  // Claim: 5 percent of 10001 cents, rounded half up. By hand: 10001 x 500, plus 5000, divided by 10000, dropping the remainder, is 500.
  assert.equal(volumeDiscountCents(makeInvoice(10001)), 500);
});

test('the discount rounds half up', () => {
  // Claim: 5 percent of 12010 cents is 600.5 cents, which rounds half up to 601. By hand: 12010 x 500, plus 5000, divided by 10000, is 601.
  assert.equal(volumeDiscountCents(makeInvoice(12010)), 601);
});
