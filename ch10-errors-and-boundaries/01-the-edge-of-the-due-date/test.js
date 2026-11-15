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

test('an invoice is not overdue on its due date', () => {
  // Doubles: none. The rule is pure, so the test calls it directly.
  // Why: the claim is about the boundary, so the test uses the exact due date.
  // Arrange
  const invoice = makeInvoice();
  // Act
  const result = isOverdue(invoice, '2026-11-01');
  // Assert
  assert.equal(result, false);
});

test('an invoice is overdue the day after its due date', () => {
  // Doubles: none.
  // Why: one day later is the first day the claim says the invoice is overdue.
  // Arrange
  const invoice = makeInvoice();
  // Act
  const result = isOverdue(invoice, '2026-11-02');
  // Assert
  assert.equal(result, true);
});

test('a paid invoice is not overdue after its due date', () => {
  // Doubles: none.
  // Why: the claim is that money must still be owed, so a paid invoice is never overdue.
  // Arrange
  const invoice = makeInvoice([2712]);
  // Act
  const result = isOverdue(invoice, '2026-11-14');
  // Assert
  assert.equal(result, false);
});
