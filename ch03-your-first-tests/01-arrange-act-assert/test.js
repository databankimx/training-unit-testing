import { test } from 'node:test';
import assert from 'node:assert/strict';
import { subtotalCents, taxCents, totalCents } from './invoicing/index.js';

test('subtotal of invoice 1002 is 2505 cents', () => {
  // Claim: the subtotal is the sum of quantity times unit price, which is 2505 cents.
  // Arrange
  const invoice = {
    id: 'INV-1002',
    customerName: 'Bob Diaz',
    customerEmail: 'bob.diaz@example.invalid',
    dueDate: '2026-11-01',
    taxRateBasisPoints: 825,
    lines: [{ description: 'Widget', quantity: 3, unitPriceCents: 835 }],
    paymentsCents: [],
  };

  // Act
  const result = subtotalCents(invoice);
  // Assert
  assert.equal(result, 2505);
});
