import { test } from 'node:test';
import assert from 'node:assert/strict';
import { lateFee } from './invoicing/index.js';

test('no late fee before the due date', () => {
  // Claim: an invoice that is not yet overdue owes no late fee.
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
  const result = lateFee(invoice, '2026-10-31');
  // Assert
  assert.equal(result, 0);
});

test('minimum late fee on a small balance', () => {
  // Claim: an overdue invoice with a small balance owes the minimum fee of 500 cents.
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
  const result = lateFee(invoice, '2026-11-14');
  // Assert
  assert.equal(result, 500);
});
