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

test('an overpaid invoice is not overdue', () => {
  // Doubles: none.
  // Why: a payment larger than the total leaves a credit, a negative balance. The claim is about whether money is owed.
  // Arrange
  const invoice = makeInvoice([3000]);
  // Act
  const result = isOverdue(invoice, '2026-11-14');
  // Assert
  assert.equal(result, false);
});
