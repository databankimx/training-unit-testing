import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isOverdue, parseDate } from './invoicing/index.js';

function makeInvoice(paymentsCents = []) {
  return {
    id: 'INV-1002',
    customerName: 'Bob Diaz',
    customerEmail: 'bob.diaz@example.invalid',
    dueDate: '2026-11-01',
    taxRateBasisPoints: 825,
    lines: [{ description: 'Widget', quantity: 3, unitPriceCents: 835 }],
    paymentsCents,
  };
}

test('a date that is not real is refused', () => {
  // Doubles: none.
  // Why: the claim is that the library refuses a date that does not exist, so the test checks for a refusal.
  // Arrange
  const text = '2026-02-30';
  // Act and assert
  assert.throws(() => parseDate(text), RangeError);
});

test('a date in the wrong shape is refused', () => {
  // Doubles: none.
  // Why: the claim is that the library reads only YYYY-MM-DD, so the test checks a slash-separated date.
  // Arrange
  const text = '2026/11/14';
  // Act and assert
  assert.throws(() => parseDate(text), RangeError);
});
